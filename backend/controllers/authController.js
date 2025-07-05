const {
  registerUserService,
  loginUserService,
  generateAccessAndRefreshToken,
  refreshTokenService,
  logoutUserService,
} = require("../services/userService.js");


const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(name)
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    console.log(req.body)
    const user = await registerUserService(req.body);
    console.log(user)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Registration failed" });
  }
};



const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await loginUserService(req.body);
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

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
        accessToken,
        refreshToken,
      });
  } catch (err) {
    res.status(401).json({ message: err.message || "Login failed" });
  }
};
// ========================
// Logout Controller
// ========================
const logOutUser = async (req, res) => {
  try {
    await logoutUserService(req.user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
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
      secure: process.env.NODE_ENV === "production",
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
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

// ========================
// Export All Controllers
// ========================
module.exports = {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  getCurrentUser,
};