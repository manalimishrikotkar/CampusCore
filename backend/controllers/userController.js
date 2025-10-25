const User = require("../models/User");
const { getLeaderboard } = require("../services/leaderboardService");
const Post = require("../models/Post");
const QnA = require("../models/QnA");
const Quiz = require("../models/Quiz");


// ✅ Get logged-in user's dashboard info
exports.getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id; // populated by authMiddleware

    // Fetch the user info
    const user = await User.findById(userId).select("name email semester branch points");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🏆 Fetch leaderboard data from the service
    const leaderboard = await getLeaderboard();

    // Find this user's rank from leaderboard
    const rankIndex = leaderboard.findIndex(entry => entry.name === user.name);
    const rank = rankIndex !== -1 ? rankIndex + 1 : "—";

    res.status(200).json({
      name: user.name,
      email: user.email,
      semester: user.semester || "N/A",
      branch: user.branch || "N/A",
      points: user.points || 0,
      rank,
    });
  } catch (error) {
    console.error("Error fetching user dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
};

exports.getUserQuickStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [notesCount, questionsCount, user] = await Promise.all([
      Post.countDocuments({ createdBy: userId }),
      QnA.countDocuments({ createdBy: userId }),
      User.findById(userId).select("points"),
    ]);

    // TODO: replace with real quiz count if you have QuizResult model
    const quizzesTaken = 0;

    res.status(200).json({
      notesUploaded: notesCount,
      quizzesTaken,
      questionsAsked: questionsCount,
      totalPoints: user?.points || 0,
    });
  } catch (error) {
    console.error("Error fetching quick stats:", error);
    res.status(500).json({ message: "Failed to fetch quick stats" });
  }
};



// Helper: format "x hours ago"
function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(date).toLocaleDateString();
}

// 🧩 Combined recent activity
exports.getRecentActivity = async (req, res) => {
  try {
    const userId = req.user._id;

    // 📝 Recent Notes Uploaded
    const recentNotes = await Post.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title createdAt");

    const noteActivities = recentNotes.map((note) => ({
      type: "upload",
      title: `Uploaded notes: ${note.title}`,
      time: timeAgo(note.createdAt),
      points: 50,
      createdAt: note.createdAt
    }));

    // 🧠 Recent Quiz Attempts
    const recentQuizzes = await Quiz.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("quizTitle score createdAt");

    const quizActivities = recentQuizzes.map((quiz) => ({
      type: "quiz",
      title: `Completed quiz: ${quiz.quizTitle} (Score: ${quiz.score})`,
      time: timeAgo(quiz.createdAt),
      points: 25,
      createdAt: quiz.createdAt
    }));

    // 💬 Recent Questions
    const recentQuestions = await QnA.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("question createdAt");

    const questionActivities = recentQuestions.map((q) => ({
      type: "question",
      title: `Asked: ${q.question}`,
      time: timeAgo(q.createdAt),
      points: 10,
      createdAt: q.createdAt
    }));

    // 💭 Recent Answers (inside QnA.replies)
    const qnas = await QnA.find({ "replies.createdBy": userId }).select("replies.question replies.createdAt");
    const answerActivities = [];

    qnas.forEach((qna) => {
      qna.replies.forEach((reply) => {
        if (reply.createdBy.toString() === userId.toString()) {
          answerActivities.push({
            type: "answer",
            title: `Answered: ${reply.answer.slice(0, 60)}...`,
            time: timeAgo(reply.createdAt),
            points: 15,
            createdAt: reply.createdAt
          });
        }
      });
    });

    // Combine all and sort by latest
    const allActivities = [
      ...noteActivities,
      ...quizActivities,
      ...questionActivities,
      ...answerActivities,
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.status(200).json(allActivities);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Failed to fetch recent activity" });
  }
};



// 🏆 Get user achievements
exports.getUserAchievements = async (req, res) => {
  try {
    const userId = req.user._id;

    // Count user uploads (notes)
    const notesCount = await Post.countDocuments({ createdBy: userId, approvalStatus: "approved" });

    // Count user replies (answers)
    const qnaData = await QnA.find({ "replies.repliedBy": userId });
    let totalAnswers = 0;
    qnaData.forEach(qna => {
      totalAnswers += qna.replies.filter(r => r.repliedBy?.toString() === userId.toString()).length;
    });

    // Count quizzes created by user
    const quizzesCreated = await Quiz.countDocuments({ createdBy: userId });

    // Prepare achievements
    const achievements = [
      {
        title: "Quiz Master",
        description: `Created ${quizzesCreated} quizzes`,
        icon: "trophy",
        color: "yellow",
      },
      {
        title: "Contributor",
        description: `Uploaded ${notesCount} notes`,
        icon: "upload",
        color: "blue",
      },
      {
        title: "Helper",
        description: `Answered ${totalAnswers} questions`,
        icon: "message",
        color: "green",
      },
    ];

    res.status(200).json(achievements);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ message: "Failed to fetch achievements" });
  }
};
