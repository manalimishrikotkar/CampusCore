import os
import base64
import json
import re
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException,Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
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

# === Initialize Gemini ===
gemini_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-pro",
    api_key=GEMINI_API_KEY
)


# === Helper: Convert PDF to data URL ===
def pdf_bytes_to_dataurl(pdf_bytes: bytes) -> str:
    b64 = base64.b64encode(pdf_bytes).decode("utf-8")
    return f"data:application/pdf;base64,{b64}"


# === Helper: Generate tags from text (full content per tag) ===
# def divide_text_into_tags(text: str) -> dict:
#     prompt = f"""
#     You are a JSON generator.
#     Analyze the following text and divide it into the most important topics or tags.

#     Return ONLY a valid JSON object (no extra text).
#     Each key should be a topic/tag.
#     Each value should contain the ENTIRE content relevant to that topic/tag from the text, not a summary.

#     Text:
#     {text}
#     """
#     try:
#         response = gemini_llm.invoke([HumanMessage(content=prompt)])
#         raw_output = response.content.strip()
#         print("🔹 Gemini raw response:\n", raw_output)

#         # Extract JSON portion
#         match = re.search(r"\{.*\}", raw_output, re.DOTALL)
#         if not match:
#             raise ValueError("No JSON object found in Gemini output.")
#         json_str = match.group()

#         tags_dict = json.loads(json_str)
#         return tags_dict

#     except Exception as e:
#         print("⚠️ Gemini parsing error:", e)
#         return {"error": "Failed to extract tags"}

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


@app.post("/api/ocr")
async def ocr_upload(request: Request):
    """
    Trigger OCR using Cloudinary file URL and tags.
    Expected JSON body:
    {
        "file_url": "<cloudinary PDF URL>",
        "tags": ["Variable", "identifier", "let-var-const"]
    }
    """
    try:
        data = await request.json()
        file_url = data.get("file_url")
        user_tags = data.get("tags", [])

        if not file_url:
            raise HTTPException(status_code=400, detail="Missing 'file_url' in request body")

        print("📥 Received OCR request for:", file_url)
        print("📎 Received user tags:", user_tags)

        # ✅ Download file from Cloudinary
        response = requests.get(file_url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download file from Cloudinary")

        pdf_bytes = response.content
        if not pdf_bytes:
            raise HTTPException(status_code=400, detail="Downloaded file is empty")

        # ✅ Convert PDF to base64 data URL
        data_url = pdf_bytes_to_dataurl(pdf_bytes)
        print("dat",data_url)
        # === Call Mistral OCR ===
        payload = {
            "model": "mistral-ocr-latest",
            "document": {"type": "document_url", "document_url": data_url},
            "include_image_base64": False,
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {MISTRAL_API_KEY}",
        }

        try:
            resp = requests.post(MISTRAL_OCR_URL, headers=headers, json=payload, timeout=120)
            resp.raise_for_status()
            ocr_json = resp.json()
        except requests.RequestException as e:
            raise HTTPException(status_code=502, detail=f"Mistral OCR error: {e}")

        pages = ocr_json.get("pages", [])
        concatenated_markdown = "\n\n".join([p.get("markdown", "") for p in pages])

        # ✅ Tag-wise text division
        tags_dict = divide_text_into_tags(concatenated_markdown, user_tags)

        # === Store OCR in MongoDB ===
        ocr_doc = {
            "file_url": file_url,
            "markdown": concatenated_markdown,
            "tags_used": user_tags,
            "timestamp": datetime.utcnow(),
        }
        ocr_id = ocr_collection.insert_one(ocr_doc).inserted_id

        tags_doc = {
            "ocr_id": ocr_id,
            "file_url": file_url,
            "tags": tags_dict,
            "timestamp": datetime.utcnow(),
        }
        tags_collection.insert_one(tags_doc)

        print("✅ OCR complete for:", file_url)
        return {"ocr_id": str(ocr_id), "markdown": concatenated_markdown, "tags": tags_dict}

    except Exception as e:
        print("❌ OCR upload error:", str(e))
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")


# === Health check ===
@app.get("/ping")
def ping():
    return {"ok": True}
