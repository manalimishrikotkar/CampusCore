const qnaService = require('../services/qnaService');

// 🔘 POST /api/qna
// Create a new anonymous question
exports.postQuestion = async (req, res) => {
  try {
    console.log("req",req.user);
    const createdBy = req.user?._id || null; // Optional auth
    const {
      question,
      question_details,
      category,
      tags
    } = req.body;

    if (!question || !question_details || !category || !tags) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const qna = await qnaService.createPost({
      question,
      question_details,
      category,
      tags,
      author: "Anonymous",
      createdBy
    });

    res.status(201).json({ message: "Question posted successfully", qna });
  } catch (err) {
    console.error("Error in postQuestion:", err);
    res.status(500).json({ error: 'Failed to post question' });
  }
};


// 🔘 GET /api/qna
// Fetch all questions for public feed
exports.getQuestions = async (req, res) => {
  try {
    const qnaList = await qnaService.getAllPosts();
    res.status(200).json(qnaList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

// 🔘 POST /api/qna/:id/reply
// Reply to a question, tracked internally for leaderboard
exports.replyToQuestion = async (req, res) => {
  try {
    const repliedBy = req.user?._id || null;
    const { text } = req.body;
    const qnaId = req.params.id;

    if (!text) {
      return res.status(400).json({ error: 'Reply cannot be empty' });
    }

    const updatedQna = await qnaService.replyToPost({ qnaId, text, repliedBy });

    // Optional: Notify original poster
    const originalUser = await qnaService.getOriginalPoster(qnaId);
    if (originalUser) {
      console.log(`📢 Notify: ${originalUser.name} - Your query was answered.`);
      // Plug in email/socket notification here
    }

    res.status(200).json(updatedQna);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to post reply' });
  }
};



// 🔘 GET /api/qna/:qnaId/replies
// Fetch all replies for a given question
exports.getRepliesForQuestion = async (req, res) => {
  try {
    const { qnaId } = req.params;
    const replies = await qnaService.getRepliesByQnAId(qnaId);
    res.status(200).json(replies);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: err.message || 'Failed to fetch replies' });
  }
};

// 🔘 PATCH /api/qna/:qnaId/replies/:replyIdx/upvote
// Upvote a reply if not already upvoted by this anonymous user
// const mongoose = require('mongoose');


exports.upvoteReply = async (req, res) => {
  try {
    const { qnaId, replyId } = req.params;
    const voterId = req.headers['x-anon-id'];

    if (!voterId) {
      return res.status(400).json({ error: 'Missing anonymous voter ID' });
    }

    const qna = await qnaService.getQnAById(qnaId);
    if (!qna) {
      return res.status(404).json({ error: 'QnA not found' });
    }

    const reply = qna.replies.id(replyId); // fetch subdocument by ID
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    if (reply.upvotedBy.includes(voterId)) {
      return res.status(403).json({ error: 'Already upvoted by this user' });
    }

    reply.upvotes++;
    reply.upvotedBy.push(voterId);

    await qna.save(); // persist the changes

    res.status(200).json({ message: 'Reply upvoted successfully', reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upvote reply' });
  }
};


