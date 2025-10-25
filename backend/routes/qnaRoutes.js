const express = require('express');
const router = express.Router();
const qnaController = require('../controllers/qnaController');
const { protect } = require('../auth/rbac'); // optional if JWT middleware is used
const QnA = require("../models/QnA");

// 📝 Create a new anonymous QnA post (optionally authenticated)
router.post('/', protect, qnaController.postQuestion);

// 📃 Get all QnA posts (public feed)
router.get('/', qnaController.getQuestions);

// 💬 Reply to a question (tracks replier internally)
router.post('/:id/reply',protect, qnaController.replyToQuestion);

// 📥 Get all replies for a specific QnA post
router.get('/:qnaId/replies', qnaController.getRepliesForQuestion);

// 🔼 Upvote a specific reply within a QnA thread
router.patch('/:qnaId/replies/:replyId/upvote', qnaController.upvoteReply);

router.get("/flagged/count", async (req, res) => {
  try {
    // Assuming replies contain an `analysis.flagged` field = true
    const flaggedCount = await QnA.aggregate([
      { $unwind: "$replies" },
      { $match: { "replies.analysis.flagged": true } },
      { $count: "totalFlagged" }
    ]);

    const totalFlagged = flaggedCount.length > 0 ? flaggedCount[0].totalFlagged : 0;
    res.json({ totalFlagged });
  } catch (error) {
    console.error("Error fetching flagged replies count:", error);
    res.status(500).json({ message: "Error fetching flagged replies count" });
  }
});

module.exports = router;
