const express = require('express');
const Post = require('../models/Post');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); 
const {
  create,
  getAllPosts,
  getOne,
  update,
  remove,
  getPendingNotes,
  approveNote,
  disapproveNote,
  like
} = require('../controllers/postController');
const { getOcrSegments, generateSegmentQuiz } = require("../controllers/postController");

const { protect, allowRoles } = require('../auth/rbac');

// Admin-only routes (STATIC FIRST ✅)
router.get('/admin/pending', protect, allowRoles('admin'), getPendingNotes);
// router.put('/admin/approve/:postId', protect, allowRoles('admin'), approveNote);
router.patch("/notes/:id/approve", protect, allowRoles("admin"), approveNote);
router.patch("/notes/:id/reject", protect, allowRoles("admin"), disapproveNote);


// Then dynamic
router.get('/', protect, getAllPosts);
router.get('/:id', protect, getOne);
router.get("/ocr/:noteId", protect, getOcrSegments);
router.post("/generateQuiz", protect, generateSegmentQuiz);

// router.post('/', protect, create);
router.post("/", protect, upload.single("file"), create);




router.put('/:id/like', protect, like);
router.put('/:id', protect, allowRoles('admin'), update);
router.delete('/:id', protect, allowRoles('admin'), remove);
router.get('/approved/count', async (req, res) => {
  try {
    const count = await Post.countDocuments({ approvalStatus: 'approved' });
    res.status(200).json({ totalApproved: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch approved notes count' });
  }
});
router.get("/pending/count", async (req, res) => {
  try {
    const totalPending = await Post.countDocuments({ approvalStatus: "pending" });
    res.json({ totalPending });
  } catch (error) {
    console.error("Error fetching pending notes count:", error);
    res.status(500).json({ message: "Error fetching pending notes count" });
  }
});

router.get("/approval/stats", async (req, res) => {
  try {
    const [approvedCount, pendingCount] = await Promise.all([
      Post.countDocuments({ approvalStatus: "approved" }),
      Post.countDocuments({ approvalStatus: "pending" })
    ]);

    const total = approvedCount + pendingCount;
    const approvalRate = total > 0 ? ((approvedCount / total) * 100).toFixed(2) : 0;

    res.json({
      totalApproved: approvedCount,
      totalPending: pendingCount,
      approvalRate: `${approvalRate}%`
    });
  } catch (error) {
    console.error("Error fetching approval stats:", error);
    res.status(500).json({ message: "Error fetching approval stats" });
  }
});






module.exports = router;
