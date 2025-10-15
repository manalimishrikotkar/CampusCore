// RBAC.js
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

// Middleware to protect routes (check for valid JWT)
const protect = async (req, res, next) => {
  try {
    // console.log("req",req);
    console.log("reqat",req.cookies.accessToken);
    const token = 
      req.cookies?.accessToken || 
      (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
        ? req.headers.authorization.split(' ')[1] 
        : null);
    console.log("token",token);
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. No token provided.' });
    }
    console.log("i am here");
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decode",decoded)
    const user = await User.findById(decoded._id).select('-password -refreshToken');
    if (!user) {
      return res.status(401).json({ message: 'User not found. Invalid token.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to allow only specific roles
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { protect, allowRoles };