 const mongoose = require("mongoose")

const nodeSchema = new mongoose.Schema({
  technology: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  prerequisites: [String],
  parentId: { type: mongoose.Schema.Types.ObjectId, refPath: "parentModel" },
  parentModel: { type: String, enum: ["Roadmap", "Node"], required: true },
  level: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  visitedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Node", nodeSchema)
