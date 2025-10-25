const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authMiddleware = async (req, res, next) => {
  try {
    console.log("🛡️ In middleware");
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access token missing" });
    }

    // use the same secret as used when creating token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("✅ Decoded:", decoded);

    const user = await User.findById(decoded._id).select("-password -refreshToken");
    console.log("User:",user);
    if (!user) {
      return res.status(401).json({ message: "Invalid token or user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Auth Error:", error.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};
