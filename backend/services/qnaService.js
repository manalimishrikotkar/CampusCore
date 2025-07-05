const QnA = require('../models/QnA');

exports.createPost = async ({ question, question_details, category, tags, author, createdBy }) => {
  const qna = new QnA({
    question,
    question_details,
    category,
    tags,
    author:"Anonymous",
    createdBy
  });

  return await qna.save();
};

// 📃 Get all questions (do not include private fields in public feed)
exports.getAllPosts = async () => {
  const posts = await QnA.find()
    .sort({ createdAt: -1 })
    .select('-createdBy -replies.repliedBy'); // keep anonymity
  return posts;
};

// 👍 Upvote logic (can be expanded with upvotedBy[] to avoid spam)
// 👍 Safe upvote logic (prevents same anon from upvoting again)
exports.upvote = async (qnaId, voterId) => {
  const qna = await QnA.findById(qnaId);
  if (!qna) throw new Error('Post not found');

  if (qna.upvotedBy.includes(voterId)) {
    throw new Error('Already upvoted by this user');
  }

  qna.upvotes += 1;
  qna.upvotedBy.push(voterId);

  await qna.save();
  return qna;
};


// 💬 Reply to a post with tracked repliedBy (used in leaderboard/notifications)
exports.replyToPost = async ({ qnaId, text, repliedBy }) => {
  const qna = await QnA.findById(qnaId);
  if (!qna) throw new Error('Post not found');

  qna.replies.push({ text, repliedBy, createdAt: new Date() });
  await qna.save();
  return qna;
};

// 📥 Internal method: Get createdBy to notify after reply
exports.getOriginalPoster = async (qnaId) => {
  const qna = await QnA.findById(qnaId).populate('createdBy', 'name email');
  if (!qna) return null;
  return qna.createdBy;
};

exports.getQnAById = async (id) => {
  return await QnA.findById(id).populate('createdBy replies.repliedBy');
};

exports.getRepliesByQnAId = async (qnaId) => {
  const qna = await QnA.findById(qnaId).populate('replies.repliedBy', 'name email');
  if (!qna) throw new Error('QnA post not found');
  return qna.replies;
};
