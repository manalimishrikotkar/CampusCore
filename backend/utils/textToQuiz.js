const axios = require("axios");
require("dotenv").config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY_QUIZ;

// ✅ Correct Gemini 2.5 model endpoint
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

const MAX_TEXT_CHARS = 12000;

const generateQuestions = async (text,tags) => {
  try {
    if (text.length > MAX_TEXT_CHARS) {
      console.warn(`⚠️ Text length ${text.length} > ${MAX_TEXT_CHARS}, truncating.`);
      text = text.slice(0, MAX_TEXT_CHARS);
    }

    //     const prompt = `
    // Generate 10 multiple-choice questions (MCQs) from the given text.
    // Each question must have exactly 4 options and a correct answer key.

    // Text:
    // ${text}

    // Output strictly in JSON array format, no explanations:
    // [
    //   {
    //     "question": "string",
    //     "options": ["A", "B", "C", "D"],
    //     "answer": "B"
    //   }
    // ]
    // `;

//     const prompt = `
// Generate 10 multiple-choice questions (MCQs) from the given text.
// Each question must:
// - Have exactly 4 options (A, B, C, D)
// - Include a correct answer key
// - Include a brief description explaining why the correct option is correct
// - Ensure every tag/topic appearing in the text has at least one question

// Text:
// ${text}

// Output strictly in JSON array format, no explanations outside the JSON:
// [
//   {
//     "question": "string",
//     "options": ["A", "B", "C", "D"],
//     "answer": "A",
//     "description": "string (why this option is correct)"
//   }
// ]
// `;

const prompt = `
You are given two inputs: a block of text and a comma-separated list of tags.
Generate exactly 10 multiple-choice questions (MCQs) based on the text AND the tags.

Requirements:
- Each question must have exactly 4 options (A, B, C, D).
- Each question must include:
  - "question"
  - "options"
  - "answer"
  - "description" (explains why the correct option is correct)
  - "tag" (the single tag this question is MOSTLY related to)
  - "difficulty" ("easy" | "medium" | "hard")
- Every tag must have at least ONE question related to it.
- Questions should be based ONLY on the given text and tags.
- The "tag" must match EXACTLY one of the given tags.
- Difficulty should be realistic based on the complexity of the question.
- Output strictly in JSON array format with NO additional text.

Text:
${text}

Tags:
${tags}

Output format:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "answer": "A",
    "description": "string",
    "tag": "tagName",
    "difficulty": "easy"
  }
]
`;
console.log("text:",text);
    const response = await axios.post(
      `${GEMINI_URL}?key=${GOOGLE_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000,
      }
    );

    const modelText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!modelText) throw new Error("No response text from Gemini API");

    console.log("🧠 Gemini Raw Output:", modelText);

    // Extract JSON safely
    const match = modelText.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!match) throw new Error("No valid JSON array found in response");

    return JSON.parse(match[0]);
  } catch (err) {
    console.error("❌ Error in generateQuizFromText:", err.response?.data || err.message);
    throw new Error("Failed to generate quiz (Google model)");
  }
};

module.exports = generateQuestions;
