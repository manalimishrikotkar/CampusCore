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
// exports.replyToPost = async ({ qnaId, text, repliedBy }) => {
//   console.log("Id",qnaId);
//   const qna = await QnA.findById(qnaId);
//   console.log("qna",qna);
//   if (!qna) throw new Error('Post not found');

//   qna.replies.push({ text, repliedBy, createdAt: new Date() });
//   await qna.save();
//   return qna;
// };
// exports.replyToPost = async ({ qnaId, replyObj }) => {
//   const qna = await QnA.findById(qnaId);
//   if (!qna) throw new Error('Post not found');

//   // ✅ Push full reply object with flagged + sentiment info
//   qna.replies.push(replyObj);

//   await qna.save();
//   return qna;
// };

exports.replyToPost = async ({ qnaId, replyObj }) => {
  try {
    const qna = await QnA.findById(qnaId);
    if (!qna) throw new Error("Post not found");

    // ✅ Ensure repliedBy is stored as a proper ObjectId
    if (!replyObj.repliedBy) {
      throw new Error("Missing repliedBy in replyObj");
    }

    qna.replies.push(replyObj);
    await qna.save();

    // ✅ Populate for consistency (so frontend can show user name/email)
    await qna.populate("replies.repliedBy", "name email");

    return qna;
  } catch (err) {
    console.error("❌ Error in qnaService.replyToPost:", err);
    throw err;
  }
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
