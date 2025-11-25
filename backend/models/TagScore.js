const mongoose = require("mongoose");

const tagScoreItemSchema = new mongoose.Schema(
  {
    tag: { type: String, required: true },
    totalQuestions: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    score: { type: Number, default: 0 }, // percentage value
  },
  { _id: false }
);

const tagScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      // <- ADDED
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    // Controller sends: tagScores: tagScoresArray
    tagScores: [tagScoreItemSchema],

    overallScore: {
      type: Number,
      default: null, // optional, controller doesn't send it
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("TagScore", tagScoreSchema);