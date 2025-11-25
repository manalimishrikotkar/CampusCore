const TagScore = require ("../models/TagScore");
const Post= require ("../models/Post");
const { generateRequizOrAdvancedFromGemini } = require( "../utils/requiz");

exports.getRequizOrAdvanced = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // 1. Get latest tag score for this post and user
    const lastScore = await TagScore.findOne({ post: postId, user: userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!lastScore) {
      return res.status(404).json({
        success: false,
        message: "No tag score found. User must attempt the first quiz.",
      });
    }

    const { tagScores } = lastScore;

    // 2. Fetch Note Title + Tags
    const post = await Post.findById(postId).lean();
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const noteTitle = post.title;
    const tags = post.tags;

    // 3. Call Gemini for re-quiz or advanced roadmap
    const aiResponse = await generateRequizOrAdvancedFromGemini({
      noteTitle,
      tags,
      tagScores,
    });

    console.log("AI:",aiResponse);

    // 4. return output to frontend
    res.status(200).json({
      success: true,
      data: aiResponse,
    });
  } catch (err) {
    console.error("Error in getRequizOrAdvanced:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
