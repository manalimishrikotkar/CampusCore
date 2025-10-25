import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema({
  technology: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Roadmap", roadmapSchema);
