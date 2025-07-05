const { generateQuizFromPosts } = require('../services/quizService');
const Quiz = require('../models/Quiz')

// const Post = require('../models/Post');

exports.generateQuiz = async (req, res) => {
  const { subject } = req.body;
  console.log("req123",req);
  try {
    const quiz = await generateQuizFromPosts(subject, req.user.id);
    res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    res.json({ success: true, data: quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeTaken, score } = req.body;

    // Optional: store results to DB if needed
    console.log("Quiz submitted:", { quizId, answers, timeTaken, score });

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
    });
  } catch (err) {
    console.error("Quiz submission error:", err);
    res.status(500).json({ success: false, message: "Failed to submit quiz" });
  }
};
