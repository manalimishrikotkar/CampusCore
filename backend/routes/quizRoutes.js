// const express = require('express');
// const router = express.Router();
// const { protect } = require('../auth/rbac');
// const { generateQuiz } = require('../controllers/quizController');


// router.post('/generate', protect, generateQuiz);

// module.exports = router;
const express = require("express");
const router = express.Router();
const { getRequizOrAdvanced } = require( "../controllers/requizController");

const {
  generateQuiz,
  getQuizById, // ✅ make sure this is imported
  submitQuiz, // if using quiz submissions
} = require("../controllers/quizController");
const Quiz = require("../models/Quiz");

const { protect } = require("../auth/rbac");

// Existing routes
// router.post("/generate", protect, generateQuiz);
// router.post("/:id/submit", protect, submitQuiz);
router.post("/:postId/submit", protect, submitQuiz);
router.get("/requiz/:postId",protect, getRequizOrAdvanced);

// ✅ Add this GET route
// router.get("/:id", protect, getQuizById);

router.get("/:postId", protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ postId: req.params.postId });

    console.log("quiz:",quiz);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "No quiz found for this note" });
    }

    res.status(200).json({ success: true, quiz });
  } catch (error) {
    console.error("❌ Error fetching quiz by post ID:", error);
    res.status(500).json({ success: false, message: "Server error fetching quiz" });
  }
});

module.exports = router;
