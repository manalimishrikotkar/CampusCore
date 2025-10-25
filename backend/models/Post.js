const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
  },
  tags: [String],
  file: {
    url: String,          // Cloudinary URL
    public_id: String,    // For later deletion if needed
    contentType: String,
    originalName: String,
  },
  ocrId: { type: String }, // Reference to ocr_results document in ocr_database
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
// Post schema 
