const axios = require('axios');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const generateQuestions = async (text) => {
  const prompt = `
Generate 5 multiple-choice questions (MCQs) from the given text.
Each question must have 4 options and include the correct answer.

Text:
${text}

Output format (JSON only, no explanations):
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "answer": "B"
  }
]
`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    console.log('Raw Groq response:', content);

    // Extract first JSON array from response
    const match = content.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!match) throw new Error('No valid JSON array found in response');

    return JSON.parse(match[0]);

  } catch (err) {
    console.error('GROQ error:', err.response?.data || err.message);
    throw new Error('Failed to generate quiz');
  }
};

module.exports = generateQuestions;
