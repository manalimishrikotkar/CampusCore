const axios = require('axios');
const SAFETY_API = process.env.SAFETY_API || 'http://localhost:5002/analyze';

exports.checkToxicity = async (text) => {
  console.log("text",text)
  try {
    const { data } = await axios.post(SAFETY_API, { text });
    return data;  // { flagged, score, labels }
  } catch (err) {
    console.error('Safety API error:', err.message);
    return { flagged: false, score: 0, labels: [] };
  }
};
