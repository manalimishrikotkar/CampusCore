// const mongoose = require('mongoose');

// const quizSchema = new mongoose.Schema({
//   postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
//   subject: { type: String, required: true },
//   tags: { type: String, required: true },
//   questions: [
//     {
//       question: String,
//       options: [String],
//       answer: String
//     }
//   ],
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// }, { timestamps: true });

// module.exports = mongoose.model('Quiz', quizSchema);

const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true, // because quiz is generated from notes
    },

    subject: {
      type: String,
      required: true,
    },

    questions: [
      {
        question: String,
        options: [String],
        answer: String,

        tag: {
          type: String,
          default: "general", // <-- important for tag scoring
        },

        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
      },
    ],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);