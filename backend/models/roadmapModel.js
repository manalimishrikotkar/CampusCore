const mongoose = require("mongoose");

const roadmapSchema = new mongoose.Schema({
  technology: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Roadmap", roadmapSchema);
