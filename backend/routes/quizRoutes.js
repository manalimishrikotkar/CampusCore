// const express = require('express');
// const router = express.Router();
// const { protect } = require('../auth/rbac');
// const { generateQuiz } = require('../controllers/quizController');


// router.post('/generate', protect, generateQuiz);

// module.exports = router;
const express = require("express");
const router = express.Router();

const {
  generateQuiz,
  getQuizById, // ✅ make sure this is imported
  submitQuiz, // if using quiz submissions
} = require("../controllers/quizController");

const { protect } = require("../auth/rbac");

// Existing routes
router.post("/generate", protect, generateQuiz);
router.post("/:id/submit", protect, submitQuiz);

// ✅ Add this GET route
router.get("/:id", protect, getQuizById);

module.exports = router;
