const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getUserDashboardData,
  getUserQuickStats,
  getRecentActivity,
  getUserAchievements
} = require("../controllers/userController");
const { protect } = require("../auth/rbac");


router.get("/achievements", protect, getUserAchievements);
router.get("/recent-activity", authMiddleware, getRecentActivity);
router.get("/stats", authMiddleware, getUserQuickStats);
router.get("/me", authMiddleware, getUserDashboardData);

module.exports = router;
