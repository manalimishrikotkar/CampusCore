import os
import base64
import json
import re
import io
# import requests
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException,Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from googleapiclient.discovery import build
from google.oauth2 import service_account
from googleapiclient.http import MediaIoBaseDownload
import requests
from pymongo import MongoClient

# LangChain for Gemini
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

# === Load environment variables ===
load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

if not MISTRAL_API_KEY or not GEMINI_API_KEY:
    raise RuntimeError("❌ Set MISTRAL_API_KEY and GOOGLE_API_KEY in .env before running.")

MISTRAL_OCR_URL = "https://api.mistral.ai/v1/ocr"

# === MongoDB setup ===
client = MongoClient(MONGO_URI)
db = client["ocr_database"]
ocr_collection = db["ocr_results"]
tags_collection = db["tags_results"]
segments_collection = db["ocr_segments"]

# === FastAPI setup ===
app = FastAPI(title="📄 Handwritten PDF OCR → Mistral + Gemini Tags")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
SERVICE_ACCOUNT_FILE = 'service-account.json'  # path to your downloaded key

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)
drive_service = build('drive', 'v3', credentials=credentials)
# === Initialize Gemini ===
gemini_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-pro",
    api_key=GEMINI_API_KEY
)


# === Helper: Convert PDF to data URL ===
def pdf_bytes_to_dataurl(pdf_bytes: bytes) -> str:
    b64 = base64.b64encode(pdf_bytes).decode("utf-8")
    return f"data:application/pdf;base64,{b64}"


def divide_text_into_tags(text: str, user_tags: list = None) -> dict:
    if user_tags:
        tag_instruction = f"Use ONLY these tags: {', '.join(user_tags)}."
    else:
        tag_instruction = (
            "If tags are not provided, discover 3–6 broad, high-level tags "
            "that best represent the document. Do not go into subtopics."
        )

    prompt = f"""
    You are a JSON generator.
    Analyze the following text and divide it into topics based on this instruction:
    {tag_instruction}

    Return ONLY a valid JSON object.
    Each key = a tag.
    Each value = the ENTIRE text related to that tag from the input.

    Text:
    {text}
    """

    try:
        response = gemini_llm.invoke([HumanMessage(content=prompt)])
        raw_output = response.content.strip()
        match = re.search(r"\{.*\}", raw_output, re.DOTALL)
        if not match:
            raise ValueError("No JSON object found in Gemini output.")
        return json.loads(match.group())

    except Exception as e:
        print("⚠ Gemini parsing error:", e)
        return {"error": "Failed to extract tags"}



def download_from_google_drive(file_id: str):
    """Download a file from Google Drive using a Service Account with detailed debugging."""
    print("🔍 [DEBUG] Starting Google Drive service account download")
    print(f"📁 [DEBUG] File ID: {file_id}")

    # Load credentials from environment variable
    service_account_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    print("service_account_path",service_account_path)
    if not service_account_path or not os.path.exists(service_account_path):
        raise HTTPException(status_code=500, detail="Service account JSON not found. Check GOOGLE_APPLICATION_CREDENTIALS path.")

    print(f"🔐 [DEBUG] Using service account file: {service_account_path}")

    try:
        # Authenticate using the service account
        creds = service_account.Credentials.from_service_account_file(
            service_account_path,
            scopes=["https://www.googleapis.com/auth/drive.readonly"],
        )

        print("✅ [DEBUG] Google Drive credentials loaded successfully")

        # Initialize the Drive API client
        service = build("drive", "v3", credentials=creds)
        print("⚙️ [DEBUG] Drive API client initialized")

        # Request file metadata (to verify access and type)
        metadata = service.files().get(fileId=file_id, fields="name, mimeType, size").execute()
        print(f"📄 [DEBUG] File metadata fetched successfully: {metadata}")

        # Start download
        request = service.files().get_media(fileId=file_id)
        file_bytes = io.BytesIO()
        downloader = MediaIoBaseDownload(file_bytes, request)

        print("⬇️ [DEBUG] Starting file download...")
        done = False
        while not done:
            status, done = downloader.next_chunk()
            progress = int(status.progress() * 100) if status else 0
            print(f"📥 [DEBUG] Download progress: {progress}%")

        file_bytes.seek(0)
        file_content = file_bytes.getvalue()

        if not file_content:
            raise HTTPException(status_code=400, detail="Downloaded file is empty")

        print(f"✅ [DEBUG] File downloaded successfully ({len(file_content)} bytes)")
        return file_content

    except Exception as e:
        print(f"💥 [ERROR] Exception during Google Drive download: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Drive download failed: {str(e)}")
    
@app.post("/api/ocr")
async def ocr_upload(request: Request):
    """
    Trigger OCR using Google Drive file URL.
    Expected JSON:
    {
        "file_url": "https://drive.google.com/file/d/<file_id>/view?usp=sharing",
        "tags": ["Variable", "identifier", "let-var-const"]
    }
    """
    try:
        data = await request.json()
        print("data",data)
        file_url = data.get("file_url")
        post_id = data.get("post_id")
        user_tags = data.get("tags", [])
        

        if not file_url:
            raise HTTPException(status_code=400, detail="Missing 'file_url' in request body")

        print(f"📥 Received OCR request for: {file_url}")
        print(f"🏷️ Tags received: {user_tags}")

        # === Extract file_id from Google Drive URL ===
        if "drive.google.com" not in file_url:
            raise HTTPException(status_code=400, detail="Only Google Drive URLs are supported")

        match = re.search(r"/d/([^/]+)/", file_url)
        if not match:
            raise HTTPException(status_code=400, detail="Invalid Google Drive file URL format")
        file_id = match.group(1)
        
        
        print(f"📂 [DEBUG] Received file_id: {file_id}")

        # === Step 1: Download file bytes from Drive ===
        pdf_bytes = download_from_google_drive(file_id)
        if not pdf_bytes:
            raise HTTPException(status_code=400, detail="Downloaded file is empty")
        print(f"✅ Successfully downloaded {len(pdf_bytes)} bytes from Google Drive")

        # === Step 2: Convert to data URL for OCR ===
        data_url = pdf_bytes_to_dataurl(pdf_bytes)

        # === Step 3: Send to Mistral OCR ===
        payload = {
            "model": "mistral-ocr-latest",
            "document": {"type": "document_url", "document_url": data_url},
            "include_image_base64": False,
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {MISTRAL_API_KEY}",
        }

        resp = requests.post(MISTRAL_OCR_URL, headers=headers, json=payload, timeout=120)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"OCR API error: {resp.text}")

        ocr_json = resp.json()
        pages = ocr_json.get("pages", [])
        concatenated_markdown = "\n\n".join([p.get("markdown", "") for p in pages])

        # === Step 4: Tag-wise division (assuming your helper exists) ===
        tags_dict = divide_text_into_tags(concatenated_markdown, user_tags)

        # === Step 5: Store results in MongoDB ===
        ocr_doc = {
            "file_url": file_url,
            "markdown": concatenated_markdown,
            "tags_used": user_tags,
            "timestamp": datetime.utcnow(),
        }
        ocr_id = ocr_collection.insert_one(ocr_doc).inserted_id
        print("helooo😘")
        segment_docs = []

        for idx, page in enumerate(pages):
            # segment_docs.append({
            #     "ocr_id": ocr_id,
            #     "postId": post_id, 
            #     "file_url": file_url,
            #     "page_number": idx + 1,
            #     "markdown": page.get("markdown", ""),
            #     "text_length": len(page.get("markdown", "")),
            #     "timestamp": datetime.utcnow(),
            # })
            segment_docs.append({
                "segmentNumber": idx + 1,
                "pageStart": idx + 1,
                "pageEnd": idx + 1,
                "text": page.get("markdown", "")
            })
            
            
        print("segment Docs😊",segment_docs)
        segments_collection.insert_one({
            "ocr_id": ocr_id,
            "postId": post_id,     # <-- ADD THIS!
            "file_url": file_url,
            "segments": segment_docs,
            "timestamp": datetime.utcnow(),
        })

        # if segment_docs:
        #     segments_collection.insert_many(segment_docs)
            

        print(f"📑 Stored {len(segment_docs)} page segments")

        tags_doc = {
            "ocr_id": ocr_id,
            "file_url": file_url,
            "tags": tags_dict,
            "timestamp": datetime.utcnow(),
        }
        tags_collection.insert_one(tags_doc)

        print(f"✅ OCR complete for: {file_url}")
        return {"ocr_id": str(ocr_id), "markdown": concatenated_markdown, "tags": tags_dict}

    except HTTPException:
        raise
    except Exception as e:
        print("❌ OCR upload error:", str(e))
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")


# === Health check ===
@app.get("/ping")
def ping():
    return {"ok": True}
