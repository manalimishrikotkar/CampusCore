// services/auth.service.js

const  User  = require("../models/User.js");
const jwt = require("jsonwebtoken");

// ========================
// Generate Tokens
// ========================
const generateAccessAndRefreshToken = async (userId) => {
  console.log(userId)
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// ========================
// Register User
// ========================
// const registerUserService = async ({ name, email, password, role }) => {
//   //const existingUser = await User.findOne({ email });
//   //if (existingUser) throw new Error("User already exists");

//   const user = await User.create({ name, email, password, role });
//   return user;
// };

const registerUserService = async ({ name, email, password, role }) => {
  const user = await User.create({ name, email, password, role });

  // // Generate tokens
  // const accessToken = user.generateAccessToken();
  // const refreshToken = user.generateRefreshToken();

  // // Save refresh token in DB
  // user.refreshToken = refreshToken;
  // await user.save();

  return { user};
};


// ========================
// Login User
// ========================
const loginUserService = async ({email, password}) => {
  //console.log("Email from services")
  const user= await User.findOne({
        $or:[{email},{password}]
    })
  console.log(user)
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await user.isPasswordCorrect(password);
  console.log(isMatch)
  if (!isMatch) throw new Error("Invalid email or password");

  return user;
};

// ========================
// Refresh Token
// ========================
const refreshTokenService = async (incomingRefreshToken) => {
  const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decoded._id);

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new Error("Invalid or expired refresh token");
  }

  return generateAccessAndRefreshToken(user._id);
};

// ========================
// Logout User
// ========================
const logoutUserService = async (userId) => {
  return await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } }, { new: true });
};

// ========================
// Exports
// ========================
module.exports = {
  generateAccessAndRefreshToken,
  registerUserService,
  loginUserService,
  refreshTokenService,
  logoutUserService,
};