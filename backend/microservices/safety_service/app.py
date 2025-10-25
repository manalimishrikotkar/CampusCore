from flask import Flask, request, Response
from detoxify import Detoxify
import numpy as np
import torch
import json
import os

app = Flask(__name__)

# Load model once
MODEL_NAME = os.getenv("DETOXIFY_MODEL", "original")
model = Detoxify(MODEL_NAME)

def to_serializable(val):
    """Recursively convert any numpy/torch objects to Python primitives."""
    if isinstance(val, (np.generic, np.bool_)):
        return val.item()
    if isinstance(val, torch.Tensor):
        return val.item() if val.numel() == 1 else val.tolist()
    if isinstance(val, dict):
        return {k: to_serializable(v) for k, v in val.items()}
    if isinstance(val, (list, tuple)):
        return [to_serializable(v) for v in val]
    return val

@app.route("/analyze", methods=["POST"])
def analyze_text():
    try:
        data = request.get_json(force=True)
        text = (data.get("text") or "").strip()
        print("⚙️ Input text:", text)

        if not text:
            return Response(json.dumps({"error": "No text provided"}), status=400, mimetype="application/json")

        results = model.predict(text)
        print("🔍 Detoxify raw results:", results)
        results = to_serializable(results)  # ensure JSON-safe
        

        toxic_labels = ["toxicity", "severe_toxicity", "obscene", "threat", "insult", "identity_attack"]
        agg_score = max([float(results.get(lbl, 0.0)) for lbl in toxic_labels])
        FLAG_THRESHOLD = float(os.getenv("FLAG_THRESHOLD", 0.75))
        flagged = bool(agg_score >= FLAG_THRESHOLD)

        label_list = [{"label": k, "score": float(v)} for k, v in results.items()]
        response_data = {
            "flagged": flagged,
            "score": round(float(agg_score), 3),
            "labels": label_list,
            "threshold": FLAG_THRESHOLD
        }

        # ✅ Manual JSON serialization
        return Response(json.dumps(response_data, ensure_ascii=False), status=200, mimetype="application/json")

    except Exception as e:
        print("❌ Error in analyze_text:", e)
        return Response(json.dumps({"error": str(e)}), status=500, mimetype="application/json")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5002)))
