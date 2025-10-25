const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");
// const Post = require('../models/Post');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost, likePost
} = require('../services/postService');


// const create = async (req, res) => {
//   try {
//     const { title, description, subject, semester, tags } = req.body;
//     const userId = req.user._id;
//     const userRole = req.user.role;
//     const approvalStatus = userRole === "admin" ? "approved" : "pending";

//     console.log("📩 Incoming body:", req.body);
//     console.log("📂 Incoming file:", req.file ? req.file.originalname : "No file");

//     // ✅ Prepare data
//     const postData = {
//       title,
//       description,
//       subject,
//       semester,
//       tags: Array.isArray(tags) ? tags : JSON.parse(tags || "[]"),
//       createdBy: userId,
//       approvalStatus,
//     };

//     // ✅ Upload file to Cloudinary if provided
//     if (req.file) {
//       const uploadResult = await new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           { resource_type: "auto", folder: "campuscore_uploads" },
//           (error, result) => {
//             if (error) reject(error);
//             else resolve(result);
//           }
//         );
//         stream.end(req.file.buffer);
//       });

//       console.log("☁️ Uploaded to Cloudinary:", uploadResult.secure_url);

//       postData.file = {
//         url: uploadResult.secure_url,
//         public_id: uploadResult.public_id,
//         contentType: req.file.mimetype,
//         originalName: req.file.originalname,
//       };
//     }

//     // ✅ Save post to MongoDB
//     const post = await Post.create(postData);

//     res.status(201).json({
//       success: true,
//       message:
//         approvalStatus === "pending"
//           ? "Post submitted for admin approval"
//           : "Post published successfully",
//       data: post,
//     });
//   } catch (err) {
//     console.error("❌ Error creating post:", err);
//     res.status(500).json({ message: "Failed to create post" });
//   }
// };

// const create = async (req, res) => {
//   try {
//     const { title, description, subject, semester, tags } = req.body;
//     const userId = req.user._id;
//     const userRole = req.user.role;
//     const approvalStatus = userRole === "admin" ? "approved" : "pending";

//     console.log("📩 Incoming body:", req.body);
//     console.log("📂 Incoming file:", req.file ? req.file.originalname : "No file");

//     const postData = {
//       title,
//       description,
//       subject,
//       semester,
//       tags: Array.isArray(tags) ? tags : JSON.parse(tags || "[]"),
//       createdBy: userId,
//       approvalStatus,
//     };

//     // ✅ Upload to Cloudinary
//     if (req.file) {
//       const uploadResult = await new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           { resource_type: "auto", folder: "campuscore_uploads" },
//           (error, result) => {
//             if (error) reject(error);
//             else resolve(result);
//           }
//         );
//         stream.end(req.file.buffer);
//       });

//       console.log("☁️ Uploaded to Cloudinary:", uploadResult.secure_url);

//       postData.file = {
//         url: uploadResult.secure_url,
//         public_id: uploadResult.public_id,
//         contentType: req.file.mimetype,
//         originalName: req.file.originalname,
//       };
//     }

//     // ✅ Save post to MongoDB
//     const post = await Post.create(postData);

//     // 🧠 Trigger OCR Microservice (async but non-blocking)
//     if (post.file?.url) {
//       const ocrUrl = process.env.OCR_SERVICE_URL || "http://localhost:8000/api/ocr";
//       console.log(`🚀 Sending file to OCR service: ${ocrUrl}`);

//       const formData = new FormData();
//       // Send file URL (not buffer) — your OCR service can download it
//       formData.append("file_url", post.file.url);
//       formData.append("tags", JSON.stringify(post.tags || []));

//       try {
//         const response = await axios.post(ocrUrl, formData, {
//           headers: formData.getHeaders(),
//           maxBodyLength: Infinity,
//         });

//         console.log("🧩 OCR Service Response:", response.data);

//         // ✅ Optionally store OCR result
//         post.ocrResult = response.data;
//         await post.save();
//       } catch (err) {
//         console.error("⚠️ OCR service failed:", err.message);
//       }
//     }

//     res.status(201).json({
//       success: true,
//       message:
//         approvalStatus === "pending"
//           ? "Post submitted for admin approval (OCR in progress)"
//           : "Post published successfully",
//       data: post,
//     });
//   } catch (err) {
//     console.error("❌ Error creating post:", err);
//     res.status(500).json({ message: "Failed to create post" });
//   }
// };

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
    // ✅ Upload file to Cloudinary
    // if (req.file) {
    //   const uploadResult = await new Promise((resolve, reject) => {
    //     const stream = cloudinary.uploader.upload_stream(
    //       { resource_type: "auto", folder: "campuscore_uploads" },
    //       (error, result) => {
    //         if (error) reject(error);
    //         else resolve(result);
    //       }
    //     );
    //     stream.end(req.file.buffer);
    //   });

    //   console.log("☁️ Uploaded to Cloudinary:", uploadResult.secure_url);

    //   postData.file = {
    //     url: uploadResult.secure_url,
    //     public_id: uploadResult.public_id,
    //     contentType: req.file.mimetype,
    //     originalName: req.file.originalname,
    //   };
    // }
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


    // if (req.file) {
    //   console.log("🚀 Uploading file to Cloudinary...");

    //   const uploadResult = await new Promise((resolve, reject) => {
    //     const timeout = setTimeout(() => reject(new Error("⏱ Cloudinary upload timeout")), 120000); // 2 mins

    //     const stream = cloudinary.uploader.upload_stream(
    //       { resource_type: "auto", folder: "campuscore_uploads" },
    //       (error, result) => {
    //         clearTimeout(timeout);
    //         if (error) {
    //           console.error("❌ Cloudinary upload error:", error);
    //           reject(error);
    //         } else {
    //           console.log("✅ Cloudinary upload complete:", result.secure_url);
    //           resolve(result);
    //         }
    //       }
    //     );

    //     stream.on("error", (err) => {
    //       clearTimeout(timeout);
    //       console.error("❌ Stream error:", err);
    //       reject(err);
    //     });

    //     stream.end(req.file.buffer);
    //   });
    // }


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
  const posts = await Post.find({ approvalStatus: 'approved' }).populate('createdBy', 'name');
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
      await generateQuizForPost(note._id, note.createdBy, note.subject);
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
module.exports = { create, getAllPosts, getOne, update, remove, getPendingNotes, approveNote, disapproveNote, like, getApprovedNotesByTopic };
// Post controller 
