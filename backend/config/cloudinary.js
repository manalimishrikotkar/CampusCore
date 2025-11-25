const { v2: cloudinary } = require('cloudinary');
const https = require("https");

cloudinary.config({
  cloud_name: "dckygtwoc",
  api_key: "971974123328711",
  api_secret: "WCNyDc0nM1f92eIji1-vbOZPAbs",
});

console.log("☁️ Cloudinary config loaded:", {
  cloud_name: "dckygtwoc",
  api_key: "971974123328711" ? "✅ Loaded" : "❌ Missing",
  api_secret: "WCNyDc0nM1f92eIji1-vbOZPAbs" ? "✅ Loaded" : "❌ Missing",
});

// cloudinary.api.ping().then(console.log).catch(console.error);




module.exports = cloudinary;
