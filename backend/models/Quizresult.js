// const mongoose = require("mongoose");

// const questionResultSchema = new mongoose.Schema(
//   {
//     questionId: { type: mongoose.Schema.Types.ObjectId }, // from quiz.questions._id
//     question: String,
//     userAnswer: String,
//     correctAnswer: String,
//     isCorrect: Boolean,
//   },
//   { _id: false }
// );

// const quizResultSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     post: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Post", // note for which quiz was generated
//       required: true,
//     },
//     score: {
//       type: Number,
//       required: true,
//       min: 0,
//       max: 100,
//     },
//     totalQuestions: Number,
//     correctAnswers: Number,
//     timeTaken: Number, // in seconds
//     passed: Boolean,
//     questionResults: [questionResultSchema],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("QuizResult", quizResultSchema);

const mongoose = require("mongoose");

const questionResultSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId },
    question: String,
    userAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    tag: String, //
    difficulty: String, //
  },
  { _id: false }
);

const quizResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    totalQuestions: Number,
    correctAnswers: Number,
    timeTaken: Number,
    passed: Boolean,

    questionResults: [questionResultSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizResult", quizResultSchema);