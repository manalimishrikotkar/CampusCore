const express = require('express');
const router = express.Router();
const qnaController = require('../controllers/qnaController');
const { protect } = require('../auth/rbac'); // optional if JWT middleware is used

// 📝 Create a new anonymous QnA post (optionally authenticated)
router.post('/', protect, qnaController.postQuestion);

// 📃 Get all QnA posts (public feed)
router.get('/', qnaController.getQuestions);

// 💬 Reply to a question (tracks replier internally)
router.post('/:id/reply', qnaController.replyToQuestion);

// 📥 Get all replies for a specific QnA post
router.get('/:qnaId/replies', qnaController.getRepliesForQuestion);

// 🔼 Upvote a specific reply within a QnA thread
router.patch('/:qnaId/replies/:replyId/upvote', qnaController.upvoteReply);

module.exports = router;
