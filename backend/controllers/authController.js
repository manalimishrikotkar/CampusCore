const {
  registerUserService,
  loginUserService,
  generateAccessAndRefreshToken,
  refreshTokenService,
  logoutUserService,
} = require("../services/userService.js");

// ========================
// Register User
// ========================
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role, github, leetcode, linkedin, profileImageBase64, } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "Name, email, and password are required" });
//     }

//     const user = await registerUserService(req.body);
//     res.status(201).json({
//       message: "User registered successfully",
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         github: user.github,
//         leetcode : user.leetcode,
//         linkedin : user.linkedin,
//         profileImageBase64: user.profileImageBase64,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message || "Registration failed" });
//   }
// };
const registerUser = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      github, 
      leetcode, 
      linkedin,
      profileImageBase64,   // 🔴 add this
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // pass all fields to service
    const user = await registerUserService({
      name,
      email,
      password,
      role,
      github,
      leetcode,
      linkedin,
      profileImageBase64,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        github: user.github,
        leetcode: user.leetcode,
        linkedin: user.linkedin,
        profileImageBase64: user.profileImageBase64,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Registration failed" });
  }
};

// ========================
// Login User
// ========================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await loginUserService(req.body);
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // ✅ Cookie options for local testing (localhost:3000 <-> 5000)
    const cookieOptions = {
      httpOnly: true,
      secure: false, // only true in production (HTTPS)
      sameSite: "lax", // must be lax for cross-port cookie sharing
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    console.log("✅ Setting cookies:", accessToken ? "YES" : "NO");

    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(401).json({ message: err.message || "Login failed" });
  }
};

// ========================
// Logout
// ========================
const logOutUser = async (req, res) => {
  try {
    await logoutUserService(req.user?._id);

    const options = {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    };

    res
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .status(200)
      .json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Logout failed" });
  }
};

// ========================
// Refresh Access Token
// ========================
const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const { accessToken, refreshToken } = await refreshTokenService(incomingRefreshToken);

    const options = {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    };

    res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .status(200)
      .json({
        message: "Access token refreshed",
        accessToken,
        refreshToken,
      });
  } catch (err) {
    res.status(401).json({ message: err.message || "Invalid refresh token" });
  }
};

// ========================
// Get Current User
// ========================
const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Current user fetched successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch user" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  getCurrentUser,
};
