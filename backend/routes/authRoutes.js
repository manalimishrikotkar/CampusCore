// User Routes
const express = require("express");
const {
  logOutUser,
  registerUser,
  loginUser,
  refreshAccessToken,
  getCurrentUser,
} = require("../controllers/authController.js");

const { protect } = require("../auth/rbac.js");
 

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

// Protected routes
router.post("/logout", protect, logOutUser);
router.get("/current-user", protect, getCurrentUser);

// Future enhancement
// router.patch("/update-account", protect, updateAccountDetails);

module.exports = router;