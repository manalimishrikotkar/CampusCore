const express = require('express');
const router = express.Router();
const QnA = require('../models/QnA');
const adminController = require("../controllers/postController");
const { protect, allowRoles } = require('../auth/rbac');

// router.get('/flagged', protect, allowRoles('admin'), async (req, res) => {
//   const flaggedReplies = await QnA.find({ 'replies.flagged': true });
//   res.json(flaggedReplies);
// });


// ✅ 1. Get all flagged replies
router.get("/flagged-replies", async (req, res) => {
  try {
    // Assuming replies have an analysis object with toxicity score
    const flaggedQnas = await QnA.find({
      "replies.flagged": true,
    }).populate("replies.repliedBy", "name email");
    console.log("Flagged",flaggedQnas);

    res.status(200).json(flaggedQnas);
  } catch (error) {
    console.error("Error fetching flagged replies:", error);
    res.status(500).json({ message: "Failed to fetch flagged replies" });
  }
});

// ✅ 2. Delete a flagged reply
router.delete("/flagged-replies/:qnaId/:replyId", async (req, res) => {
  const { qnaId, replyId } = req.params;
  try {
    await QnA.findByIdAndUpdate(qnaId, {
      $pull: { replies: { _id: replyId } },
    });
    res.status(200).json({ message: "Flagged reply deleted successfully" });
  } catch (error) {
    console.error("Error deleting flagged reply:", error);
    res.status(500).json({ message: "Failed to delete reply" });
  }
});

// ✅ 3. Ignore a flagged reply (mark as safe)
router.patch("/flagged-replies/:qnaId/:replyId/ignore", async (req, res) => {
  const { qnaId, replyId } = req.params;
  try {
    await QnA.updateOne(
      { _id: qnaId, "replies._id": replyId },
      { $set: { "replies.$.analysis.flagged": false } }
    );
    res.status(200).json({ message: "Flag ignored successfully" });
  } catch (error) {
    console.error("Error ignoring flagged reply:", error);
    res.status(500).json({ message: "Failed to ignore reply" });
  }
});

router.get(
  "/pending-notes",
  protect,
  allowRoles("admin"),
  adminController.getPendingNotes
);

// ✅ Approve a note
router.patch(
  "/notes/:id/approve",
  protect,
  allowRoles("admin"),
  adminController.approveNote
);

// ❌ Disapprove a note
router.patch(
  "/notes/:id/reject",
  protect,
  allowRoles("admin"),
  adminController.disapproveNote
);

router.get(
  "/notes/approved-by-topic",
  protect,
  allowRoles("admin"),
  adminController.getApprovedNotesByTopic
);


module.exports = router;
