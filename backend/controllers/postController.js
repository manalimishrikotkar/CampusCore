const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const Post = require("../models/Post");
// const Post = require('../models/Post');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost, likePost
} = require('../services/postService');

const mongoose = require("mongoose");

const ocrConnection = mongoose.createConnection(
  process.env.MONGO_URI_OCR || "mongodb://localhost:27017/ocr_database",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);


const OCRSegmentSchema = new mongoose.Schema(
  {
    ocr_id: mongoose.Schema.Types.ObjectId,

    // ⚠️ IMPORTANT: FastAPI stores post_id as STRING
    postId: {
      type: String,
      required: true,
    },

    file_url: String,

    segments: [
      {
        segmentNumber: Number,
        pageStart: Number,
        pageEnd: Number,
        text: String,
      },
    ],

    timestamp: Date,
  },
  { collection: "ocr_segments" }
);

const OCRSegments = ocrConnection.model("ocr_segments", OCRSegmentSchema);


const getOcrSegments = async (req, res) => {
  try {
    const { noteId } = req.params;

    // We stored post_id as a plain string in Python, so no ObjectId casting here
    const doc = await OCRSegments.findOne({ postId: noteId });

    if (!doc) {
      console.log("⚠️ No OCR segments found for note:", noteId);
      return res.json({ segments: [] });
    }

    console.log("✅ Found OCR doc for note:", noteId, "segments count:", doc.segments?.length || 0);

    // send segments exactly as stored
    res.json({ segments: doc.segments || [] });
  } catch (err) {
    console.error("❌ OCR segments fetch error:", err);
    res.status(500).json({ error: "Failed to load OCR segments" });
  }
};


const generateSegmentQuiz = async (req, res) => {
  try {
    const { segmentText } = req.body;

    if (!segmentText)
      return res.status(400).json({ error: "Missing segmentText" });

    const prompt = `
Create 3 MCQs based ONLY on this text. JSON only, no explanation.

Text:
${segmentText}

Format:
[
  {
    "question": "...",
    "options": ["A rule for writing JavaScript", "Letters", "..."],
    "answer": "A rule for writing JavaScript"
  }
]
    `;

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GOOGLE_API_KEY_QUIZ}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    let output = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 🧹 Clean markdown-style fences if present
    output = output
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const quiz = JSON.parse(output);
    

    res.json({ questions: quiz });

  } catch (err) {
    console.error("❌ Segment quiz error:", err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
};




const create = async (req, res) => {
  try {
    const { title, description, subject, semester, tags } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    const approvalStatus = userRole === "admin" ? "approved" : "pending";

    console.log("📩 Incoming body:", req.body);
    console.log("📂 Incoming file:", req.file ? req.file.originalname : "No file");

    const postData = {
      title,
      description,
      subject,
      semester,
      tags: Array.isArray(tags) ? tags : JSON.parse(tags || "[]"),
      createdBy: userId,
      approvalStatus,
    };
    console.log("req11", req.file);

    // ✅ Upload file to Google Drive
    if (req.file) {
      const { uploadFileToDrive } = require('../utils/googleDriveOAuth');
      const uploadResult = await uploadFileToDrive(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        process.env.DRIVE_FOLDER_ID // optional: your personal Drive folder ID
      );

      postData.file = {
        url: uploadResult.viewLink,
        downloadUrl: uploadResult.downloadLink,
        driveFileId: uploadResult.id,
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
      };
    }
    // ✅ Save post in main DB
    const post = await Post.create(postData);

    // 🧠 Trigger OCR microservice (non-blocking)
    if (post.file?.url) {

      const ocrUrl = process.env.OCR_SERVICE_URL || "http://localhost:8000/api/ocr";
      console.log(`🚀 Sending file to OCR service: ${ocrUrl}`);

      try {
        const response = await axios.post(
          ocrUrl,
          {
            file_url: post.file.url,
            tags: post.tags || [],
            post_id: post._id,
          },
          {
            headers: { "Content-Type": "application/json" },
            maxBodyLength: Infinity,
            // timeout: 12000000,
          }
        );

        console.log("🧩 OCR Service Response:", response.data);

        // ✅ Store OCR reference ID in Post
        if (response.data.ocr_id) {
          post.ocrId = response.data.ocr_id;
          await post.save();
        }
      } catch (err) {
        console.error("⚠️ OCR service failed:", err.message);
      }
    }

    res.status(201).json({
      success: true,
      message:
        approvalStatus === "pending"
          ? "Post submitted for admin approval (OCR processing triggered)"
          : "Post published successfully",
      data: post,
    });
  } catch (err) {
    console.error("❌ Error creating post:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

const getAllPosts = async (req, res) => {
  const posts = await Post.find({ approvalStatus: "approved" })
    .populate("createdBy", "name github leetcode linkedin profileImageUrl")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: posts });
};



const getOne = async (req, res) => {
  const post = await getPostById(req.params.id);
  res.json(post);
};

const update = async (req, res) => {
  const post = await updatePost(req.params.id, req.body);
  res.json(post);
};

const remove = async (req, res) => {
  await deletePost(req.params.id);
  res.json({ msg: 'Post deleted' });
};


// const getPendingPosts = async (req, res) => {
//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ message: 'Access denied' });
//   }

//   const posts = await Post.find({ approvalStatus: 'pending' }).populate('createdBy', 'name');
//   res.status(200).json({ success: true, data: posts });
// };


// const approvePost = async (req, res) => {
//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ message: 'Only admin can approve posts' });
//   }

//   const post = await Post.findByIdAndUpdate(
//     req.params.postId,
//     { approvalStatus: 'approved' },
//     { new: true }
//   );

//   if (!post) {
//     return res.status(404).json({ message: 'Post not found' });
//   }

//   res.status(200).json({ message: 'Post approved', data: post });
// };

const getPendingNotes = async (req, res) => {
  try {
    const pendingNotes = await Post.find({ approvalStatus: "pending" })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(pendingNotes);
  } catch (error) {
    console.error("Error fetching pending notes:", error);
    res.status(500).json({ message: "Failed to fetch pending notes" });
  }
};

//  ✅ Approve a note
// const approveNote = async (req, res) => {
//   try {
//     const note = await Post.findByIdAndUpdate(
//       req.params.id,
//       { approvalStatus: "approved" },
//       { new: true }
//     );
//     if (!note) return res.status(404).json({ message: "Note not found" });
//     res.status(200).json({ message: "Note approved successfully", note });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to approve note" });
//   }
// };


const { generateQuizForPost } = require("../services/quizService");

const approveNote = async (req, res) => {
  try {
    const note = await Post.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: "approved" },
      { new: true }
    );

    if (!note) return res.status(404).json({ message: "Note not found" });

    // 🧠 Trigger quiz generation (non-blocking)
    try {
      console.log(`🚀 Generating quiz for approved note: ${note._id}`);
      await generateQuizForPost(note._id, note.createdBy, note.subject, note.tags);
      console.log("✅ Quiz generated successfully after approval.");
    } catch (quizErr) {
      console.error("⚠️ Quiz generation failed:", quizErr.message);
    }

    res.status(200).json({
      message: "Note approved successfully and quiz generation triggered",
      note,
    });
  } catch (error) {
    console.error("❌ Error approving note:", error);
    res.status(500).json({ message: "Failed to approve note" });
  }
};


// const approveNote = async (req, res) => {
//   try {
//     const note = await Post.findByIdAndUpdate(
//       req.params.id,
//       { approvalStatus: "approved" },
//       { new: true }
//     );

//     if (!note) return res.status(404).json({ message: "Note not found" });

//     // ✅ Ensure file exists
//     if (!note.file || !fs.existsSync(note.file)) {
//       console.warn("⚠ No file found for OCR:", note.file);
//       return res.status(200).json({
//         message: "Note approved (no OCR file found)",
//         note,
//       });
//     }

//     // ✅ Prepare request to OCR microservice
//     const ocrUrl = process.env.OCR_SERVICE_URL || "http://localhost:8000/api/ocr";
//     const formData = new FormData();
//     formData.append("file", fs.createReadStream(note.file));

//     // ✅ Send tags along with file
//     const response = await axios.post(ocrUrl, formData, {
//       headers: {
//         ...formData.getHeaders(),
//         "x-tags": JSON.stringify(note.tags || []),
//       },
//       maxBodyLength: Infinity,
//     });

//     console.log("🧠 OCR Service Response:", response.data);

//     res.status(200).json({
//       message: "Note approved and OCR processed successfully",
//       note,
//       ocrResult: response.data,
//     });
//   } catch (error) {
//     console.error("❌ OCR Error:", error.message);
//     res.status(500).json({ message: "Failed to approve or process note" });
//   }
// };



// ✅ Disapprove a note
const disapproveNote = async (req, res) => {
  try {
    const note = await Post.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: "rejected" },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(200).json({ message: "Note rejected successfully", note });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject note" });
  }
};

const like = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await likePost(postId, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Post liked successfully',
      data: post
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getApprovedNotesByTopic = async (req, res) => {
  try {
    const data = await Post.aggregate([
      { $match: { approvalStatus: "approved" } }, // only approved notes
      {
        $group: {
          _id: "$subject",       // group by subject
          approved: { $sum: 1 }  // count approved notes
        }
      },
      {
        $match: { approved: { $gt: 0 } } // include only subjects with approved > 0
      },
      {
        $project: {
          _id: 0,
          topic: "$_id",         // rename field for frontend
          approved: 1
        }
      },
      { $sort: { topic: 1 } }    // sort alphabetically
    ]);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching approved notes by topic:", error);
    res.status(500).json({ message: "Failed to fetch analytics data" });
  }
};
module.exports = { create, getAllPosts, getOne, update, remove, getPendingNotes, approveNote, disapproveNote, like, getApprovedNotesByTopic, getOcrSegments, generateSegmentQuiz };
// Post controller 
