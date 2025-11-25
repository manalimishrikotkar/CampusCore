// utils/gemini.js
import axios from "axios";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MAX_TEXT_CHARS = 12000;
const API_KEY = process.env.GOOGLE_API_KEY_QUIZ;

if (!API_KEY) {
  console.warn("GOOGLE_API_KEY_QUIZ not set; Gemini requests will fail");
}

export async function generateQuestionsFromText(text, questionCount = 3) {
  try {
    if (!text || typeof text !== "string") throw new Error("Invalid text");

    let truncated = text;
    if (text.length > MAX_TEXT_CHARS) {
      truncated = text.slice(0, MAX_TEXT_CHARS);
    }

    const prompt = `
Generate exactly ${questionCount} very short multiple-choice questions (MCQs) from the given text.
Each question should have 4 options (A, B, C, D) and a single correct answer.
Respond ONLY with a JSON array exactly like this:
[
  {
    "question": "string",
    "options": ["A","B","C","D"],
    "answer": "B"
  }
]
Text:
${truncated}
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const res = await axios.post(`${GEMINI_URL}?key=${API_KEY}`, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 60000
    });

    const modelText = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!modelText) throw new Error("No text returned from Gemini");

    // Attempt to extract JSON array from modelText
    const jsonMatch = modelText.match(/\[\s*{[\s\S]}\s\]/);
    if (!jsonMatch) {
      // as fallback, try to parse whole string
      try {
        return JSON.parse(modelText);
      } catch (e) {
        throw new Error("Failed to parse JSON from Gemini response");
      }
    }

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("generateQuestionsFromText error:", err.response?.data || err.message);
    throw err;
  }
}