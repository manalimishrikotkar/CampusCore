// utils/requizGemini.js
const axios = require ("axios");

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const API_KEY = process.env.GOOGLE_API_KEY_QUIZ;

if (!API_KEY) {
  console.warn("GOOGLE_API_KEY_QUIZ not set; Gemini requests will fail");
}

/**
 * Generate Re-Quiz OR Advanced Recommendations using Gemini
 */
 async function generateRequizOrAdvancedFromGemini({
  noteTitle,
  tags,
  tagScores,
}) {
  try {
    if (!noteTitle || !tags || !tagScores)
      throw new Error("Missing required fields for requiz generation");

    // Determine Mode
    const allHigh = tagScores.every((t) => t.score > 75);
    // const mode = allHigh ? "advanced" : "requiz";

    // Prompt
    const prompt = `
You are given:
1. Note Title: "${noteTitle}"
2. Tags: ${tags.join(", ")}
3. Performance report:
${JSON.stringify(tagScores, null, 2)}

Your task:
Generate a re-quiz of 10 questions or advanced recommendations depending on the user's performance.

RULES:
- If a tag score is BELOW 40:
    → Generate EASY questions for that tag.
- If a tag score is BETWEEN 40 and 75:
    → Generate MEDIUM difficulty questions for that tag.
- If ALL tag scores are ABOVE 75:
    → Generate HARD difficulty questions for that tag., provide advanced topics + learning roadmap.

Output Format (strict JSON):
{

  "questions": [
    {
      "tag": "string",
      "difficulty": "easy" | "medium" | "hard",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "description": "string"
    }
  ],
  "advancedTopics": ["string"],
  "roadmap": ["string"]
}

Rules:
- For each tag > 75 → generate at least 2 HARD questions. .
- For each tag < 40 → generate at least 2 EASY questions.
- For each tag 40–75 → generate at least 2 MEDIUM/HARD questions.
- Ensure the output is VALID JSON with NO extra text.
`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const response = await axios.post(`${GEMINI_URL}?key=${API_KEY}`, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 60000,
    });

    const content =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!content) {
      throw new Error("No text returned from Gemini for re-quiz generation");
    }

    // -------- Extract JSON Safely ----------
    let jsonStr = null;

    // Try matching JSON block
    const match = content.match(/\{[\s\S]*\}/);
    if (match) jsonStr = match[0];
    else jsonStr = content; // fallback

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON parsing failed. Raw content:", content);
      throw new Error("Gemini returned invalid JSON");
    }

    // ---------- Validate Advanced Mode ----------
    // if (parsed.mode === "advanced") {
    //   parsed.questions = []; // enforce empty questions
    //   if (!Array.isArray(parsed.advancedTopics)) parsed.advancedTopics = [];
    //   if (!Array.isArray(parsed.roadmap)) parsed.roadmap = [];
    // }
    console.log("parsed:",parsed);

    return parsed;
  } catch (err) {
    console.error(
      "generateRequizOrAdvancedFromGemini error:",
      err.response?.data || err.message
    );
    throw err;
  }
}

module.exports = {
  generateRequizOrAdvancedFromGemini,
};
