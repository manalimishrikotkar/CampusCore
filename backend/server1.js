import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Node from "./models/nodeModel.js";
import Roadmap from "./models/roadmapModel.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-pro",
  apiKey: process.env.GOOGLE_API_KEY,
});

// Extract JSON safely
const extractJSON = (text) => {
  if (!text) return null;
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Failed to parse JSON:", err);
    return null;
  }
};

// Recursive save
const saveNodesRecursively = async (
  technology,
  nodes,
  parentId,
  parentModel = "Roadmap",
  level = 0
) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const newNode = await Node.create({
      technology,
      name: node.name,
      description: node.description || "",
      prerequisites: node.prerequisites || [],
      parentId,
      parentModel,
      level,
      order: i,
    });

    if (node.subnodes && node.subnodes.length > 0) {
      await saveNodesRecursively(
        technology,
        node.subnodes,
        newNode._id,
        "Node",
        level + 1
      );
    }
  }
};

// GET: Fetch or generate roadmap
app.get("/api/roadmap/:technology", async (req, res) => {
  const { technology } = req.params;
  try {
    // Check if roadmap exists
    let roadmap = await Roadmap.findOne({ technology });
    let nodes = await Node.find({ technology }).lean();

    if (!roadmap || nodes.length === 0) {
      // --- Call Gemini API to generate roadmap ---
      //       const prompt = `
      //   You are a learning roadmap generator.

      //   Given the name of a technology, provide a detailed, hierarchical roadmap showing all the topics, subtopics, and dependencies a person must learn to master this technology. Each topic should be represented as a "node", and include:

      //   1. Node name (the topic or concept)
      //   2. Optional description (1-2 sentences explaining the topic)
      //   3. Prerequisites (list of nodes that must be learned before this one)

      //   Format your response as a JSON object with the following structure:

      //   {
      //     "technology": "${technology}",
      //     "nodes": [
      //       {
      //         "name": "<node name>",
      //         "description": "<short description>",
      //         "prerequisites": ["<node name>", ...],
      //         "subnodes": [
      //           {
      //             "name": "<subnode name>",
      //             "description": "<short description>",
      //             "prerequisites": ["<node name>", ...],
      //             "subnodes": [ ... ]
      //           }
      //         ]
      //       }
      //     ]
      //   }

      //   Example input: "MERN Stack"

      //   Example output:
      //   {
      //     "technology": "MERN Stack",
      //     "nodes": [
      //       {
      //         "name": "Frontend",
      //         "description": "Client-side web development using React",
      //         "prerequisites": ["HTML", "CSS", "JavaScript"],
      //         "subnodes": [
      //           {
      //             "name": "React Basics",
      //             "description": "Learn components, props, and state",
      //             "prerequisites": ["HTML", "CSS", "JavaScript"],
      //             "subnodes": []
      //           }
      //         ]
      //       }
      //     ]
      //   }
      //     Provide a complete roadmap covering all essential skills, including optional advanced topics if relevant.
      //   `;
      const prompt = `
  You are a learning roadmap generator.

  Given the name of a technology, provide a detailed, hierarchical roadmap showing all the topics, subtopics, and dependencies a person must learn to master this technology. Each topic should be represented as a "node", and include:

  1. Node name (the topic or concept)
  2. Optional description (5-6 lines explaining the topic in detail)
  3. Prerequisites (list of nodes that must be learned before this one)

  Format your response as a JSON object with the following structure:

  {
    "technology": "${technology}",
    "nodes": [
      {
        "name": "<node name>",
        "description": "<detailed 5-6 line description>",
        "prerequisites": ["<node name>", ...],
        "subnodes": [
          {
            "name": "<subnode name>",
            "description": "<detailed 5-6 line description>",
            "prerequisites": ["<node name>", ...],
            "subnodes": [ ... ]
          }
        ]
      }
    ]
  }

  Example input: "MERN Stack"

  Example output:
  {
    "technology": "MERN Stack",
    "nodes": [
      {
        "name": "Frontend",
        "description": "Client-side web development using React. Covers structure, components, and JSX syntax. Teaches how to manage state effectively. Introduces React hooks and lifecycle methods. Explains styling techniques and best practices. Guides building responsive and dynamic interfaces.",
        "prerequisites": ["HTML", "CSS", "JavaScript"],
        "subnodes": [
          {
            "name": "React Basics",
            "description": "Learn components, props, and state. Understand functional vs class components. Introduction to JSX. Learn event handling and rendering logic. Explore state management. Practice building small interactive UI elements.",
            "prerequisites": ["HTML", "CSS", "JavaScript"],
            "subnodes": []
          }
        ]
      }
    ]
  }
    Provide a complete roadmap covering all essential skills, including optional advanced topics if relevant.
  `;

      const response = await llm.invoke([{ role: "user", content: prompt }]);
      const content = response?.content || response?.generations?.[0]?.text;
      const textContent =
        typeof content === "string" ? content : content?.[0]?.text;

      const parsed = extractJSON(textContent);
      if (!parsed)
        return res
          .status(500)
          .json({ error: "Failed to parse AI JSON", rawResponse: textContent });

      // Create roadmap if not exists
      if (!roadmap) roadmap = await Roadmap.create({ technology });

      // Delete old nodes if any
      await Node.deleteMany({ technology });

      // Save nodes recursively
      await saveNodesRecursively(
        parsed.technology,
        parsed.nodes,
        roadmap._id,
        "Roadmap"
      );

      nodes = await Node.find({ technology }).lean();
    }

    // Reconstruct nested structure
    const map = {};
    nodes.forEach((node) => (map[node._id] = { ...node, subnodes: [] }));
    const topNodes = [];

    nodes.forEach((node) => {
      if (node.parentModel === "Roadmap") {
        topNodes.push(map[node._id]);
      } else {
        map[node.parentId]?.subnodes.push(map[node._id]);
      }
    });
    console.log(topNodes);

    res.json({ technology, roadmapId: roadmap._id, nodes: topNodes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch or generate roadmap" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
