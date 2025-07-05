const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  questions: [
    {
      question: String,
      options: [String],
      answer: String
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
