const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  text: String,
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
}, { _id: true }); // <-- Ensures _id is auto-generated

const qnaSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  question_details: {
    type: String,
    required: true,
  },
  category: { type: String, enum: [ "Academic", "Technical", "Career", "Campus Life", "General"]
  },
  tags: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: 'Anonymous', // Displayed publicly
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',          // For private notification purposes
  },
  replies: [
    replySchema,         // Use the defined reply schema
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('QnA', qnaSchema);
