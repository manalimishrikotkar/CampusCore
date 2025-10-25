// const axios = require('axios');
// require('dotenv').config();

// const GROQ_API_KEY = process.env.GROQ_API_KEY;

// const generateQuestions = async (text) => {
//   const prompt = `
// Generate 10 multiple-choice questions (MCQs) from the given text.
// Each question must have 4 options and include the correct answer.

// Text:
// ${text}

// Output format (JSON only, no explanations):
// [
//   {
//     "question": "string",
//     "options": ["A", "B", "C", "D"],
//     "answer": "B"
//   }
// ]
// `;

//   try {
//     const response = await axios.post(
//       'https://api.groq.com/openai/v1/chat/completions',
//       {
//         model: 'llama3-8b-8192',
//         messages: [{ role: 'user', content: prompt }],
//         temperature: 0.5,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${GROQ_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     const content = response.data.choices[0].message.content;
//     console.log('Raw Groq response:', content);

//     // Extract first JSON array from response
//     const match = content.match(/\[\s*{[\s\S]*}\s*\]/);
//     if (!match) throw new Error('No valid JSON array found in response');

//     return JSON.parse(match[0]);

//   } catch (err) {
//     console.error('GROQ error:', err.response?.data || err.message);
//     throw new Error('Failed to generate quiz');
//   }
// };

// module.exports = generateQuestions;

// utils/textToQuiz.js
const axios = require("axios");
require("dotenv").config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY_QUIZ;

// Gemini 1.5 API endpoint
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent`;

// Tunables
const MAX_TEXT_CHARS = 12000;

const generateQuestions = async (text) => {
  try {
    // ✅ truncate long text (to avoid payload too large)
    if (text.length > MAX_TEXT_CHARS) {
      console.warn(`⚠️ Text length ${text.length} > ${MAX_TEXT_CHARS}, truncating.`);
      text = text.slice(0, MAX_TEXT_CHARS);
    }

    const prompt = `
Generate 10 multiple-choice questions (MCQs) from the given text.
Each question must have exactly 4 options and a correct answer key.

Text:
${text}

Output strictly in JSON array format, no explanations:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "answer": "B"
  }
]
`;

    const response = await axios.post(
      `${GEMINI_URL}?key=${GOOGLE_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      { headers: { "Content-Type": "application/json" }, timeout: 60000 }
    );

    const modelText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!modelText) throw new Error("No response text from Gemini API");

    console.log("🧠 Gemini Raw Output:", modelText);

    // Extract JSON safely
    const match = modelText.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!match) throw new Error("No valid JSON array found in response");

    const quiz = JSON.parse(match[0]);
    return quiz;
  } catch (err) {
    console.error(
      "❌ Error in generateQuizFromText:",
      err.response?.data || err.message
    );
    throw new Error("Failed to generate quiz (Google model)");
  }
};

module.exports = generateQuestions;
