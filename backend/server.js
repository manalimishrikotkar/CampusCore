const express = require("express")
const path = require("path")
const dotenv = require("dotenv")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai")
const connectDB = require("./config/database")
const { startNotificationWatcher } = require("./listeners/notificationWatcher")
const { protect } = require("../backend/auth/rbac.js");


// ===== Route Imports =====
const authRoutes = require("./routes/authRoutes")
const postRoutes = require("./routes/postRoutes")
const qnaRoutes = require("./routes/qnaRoutes")
const leaderboardRoutes = require("./routes/leadRoutes")
const quizRoutes = require("./routes/quizRoutes")
const adminRoutes = require("./routes/adminRoutes")
const userRoutes = require("./routes/userRoutes")

// ===== Additional Models =====
const Node = require("./models/nodeModel.js")
const Roadmap = require("./models/roadmapModel.js")

// ===== Init and Config =====
dotenv.config()
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // ✅ Allow cookies
  }),
)

// ===== MongoDB Connection (Main App) =====
connectDB()

// ===== MongoDB Connection (LangChain Roadmap) =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected (LangChain Roadmap)"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err))

// ===== Notification Watcher =====
startNotificationWatcher()

// ===== Gemini LLM Setup =====
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-pro",
  apiKey: process.env.GOOGLE_API_KEY,
})

// ===== JSON Extraction Helper =====
const extractJSON = (text) => {
  if (!text) return null
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim()
  try {
    return JSON.parse(cleaned)
  } catch (err) {
    console.error("❌ Failed to parse JSON:", err)
    return null
  }
}

// ===== Recursive Node Saver =====
const saveNodesRecursively = async (technology, nodes, parentId, parentModel = "Roadmap", level = 0) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const newNode = await Node.create({
      technology,
      name: node.name,
      description: node.description || "",
      prerequisites: node.prerequisites || [],
      parentId,
      parentModel,
      level,
      order: i,
    })

    if (node.subnodes && node.subnodes.length > 0) {
      await saveNodesRecursively(technology, node.subnodes, newNode._id, "Node", level + 1)
    }
  }
}

// ===== Unified Roadmap Endpoint =====
app.get("/api/roadmap/:technology", async (req, res) => {
  const { technology } = req.params
  try {
    let roadmap = await Roadmap.findOne({ technology })
    let nodes = await Node.find({ technology }).lean()

    console.log(`\n📊 Query Results for ${technology}:`)
    console.log(`   Total nodes in DB: ${nodes.length}`)
    console.log(`   Roadmap exists: ${!!roadmap}`)

    if (!roadmap || nodes.length === 0) {
      console.log(`\n🔄 Generating new roadmap for ${technology}...`)

      const prompt = `
You are a learning roadmap generator.

Given the name of a technology, provide a detailed, hierarchical roadmap showing important topics, subtopics, and dependencies a person must learn to master this technology. Each topic should be represented as a "node", and include:

1. Node name (the topic or concept)
2. description (5-6 lines explaining the topic in detail and not with relation to the roadmap learnings)
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

### Example Input:
"MERN Stack"

### Example Output:
{
  "technology": "MERN Stack",
  "nodes": [
    {
      "name": "Frontend Development",
      "description": "Frontend development focuses on creating the visual and interactive parts of a web application that users engage with directly. It involves building layouts, managing UI logic, and ensuring responsiveness across devices. A strong frontend enables smooth user interaction, accessibility, and design consistency. It typically uses HTML for structure, CSS for styling, and JavaScript for interactivity. Frontend developers also work with frameworks like React to streamline component-based design and enhance user experience.",
      "prerequisites": ["HTML", "CSS", "JavaScript"],
      "subnodes": [
        {
          "name": "React Fundamentals",
          "description": "React is a powerful JavaScript library used for building dynamic, component-based user interfaces. It introduces a declarative approach to UI development, focusing on reusable components and efficient rendering through the virtual DOM. React encourages modular architecture, making applications easier to scale and maintain. Developers use JSX for writing HTML-like syntax within JavaScript and manage state using hooks or context APIs. React is a cornerstone of modern frontend engineering, particularly in the MERN stack.",
          "prerequisites": ["JavaScript", "Frontend Development"],
          "subnodes": []
        }
      ]
    },
    {
      "name": "Backend Development",
      "description": "Backend development handles server-side logic, database interactions, and API creation that power the visible frontend. It ensures secure data flow between client and server, handles authentication, and manages business logic. In the MERN stack, Node.js and Express.js are the main technologies used to build scalable, event-driven servers. A strong backend ensures performance, reliability, and security across all connected systems.",
      "prerequisites": ["JavaScript", "Basic Networking Concepts"],
      "subnodes": [
        {
          "name": "Node.js",
          "description": "Node.js is a runtime environment that enables developers to execute JavaScript outside the browser. It’s built on Chrome’s V8 engine and allows the creation of fast, non-blocking, and scalable server-side applications. Node.js uses an event-driven architecture, making it ideal for real-time applications like chat systems and streaming platforms. Its vast ecosystem of npm packages simplifies development and integration with other technologies.",
          "prerequisites": ["JavaScript"],
          "subnodes": []
        }
      ]
    }
  ]
}


Provide a complete roadmap covering essential skills.
      `
      console.log("i am here")
      const response = await llm.invoke([{ role: "user", content: prompt }])
      const content = response?.content || response?.generations?.[0]?.text
      const textContent = typeof content === "string" ? content : content?.[0]?.text

      console.log("🤖 AI Response received, extracting JSON...")

      const parsed = extractJSON(textContent)
      if (!parsed) {
        console.error("❌ Failed to parse JSON from AI")
        return res.status(500).json({ error: "Failed to parse AI JSON", rawResponse: textContent })
      }

      console.log(`✅ JSON parsed successfully with ${parsed.nodes.length} top-level nodes`)

      if (!roadmap) {
        roadmap = await Roadmap.create({ technology })
        console.log(`✅ Roadmap document created: ${roadmap._id}`)
      }

      await Node.deleteMany({ technology })
      console.log(`🗑️  Old nodes deleted`)

      await saveNodesRecursively(parsed.technology, parsed.nodes, roadmap._id, "Roadmap")
      console.log(`✅ All nodes saved to database`)

      nodes = await Node.find({ technology }).lean()
      console.log(`📥 Requerying nodes after save: ${nodes.length} nodes found`)
    }

    // ===== BUILD HIERARCHY =====
    console.log(`\n🏗️  Building hierarchy...`)

    const nodeMap = {}
    const topLevelNodes = []

    // First pass: Create map of all nodes
    nodes.forEach((node) => {
      nodeMap[node._id.toString()] = {
        ...node,
        _id: node._id.toString(),
        parentId: node.parentId ? node.parentId.toString() : null,
        subnodes: [],
      }
    })

    console.log(`   Created map with ${Object.keys(nodeMap).length} nodes`)

    // Second pass: Build hierarchy
    nodes.forEach((node) => {
      const nodeId = node._id.toString()
      const parentId = node.parentId ? node.parentId.toString() : null

      if (node.parentModel === "Roadmap") {
        console.log(`   ✅ Found top-level node: ${node.name}`)
        topLevelNodes.push(nodeMap[nodeId])
      } else if (parentId && nodeMap[parentId]) {
        nodeMap[parentId].subnodes.push(nodeMap[nodeId])
      }
    })

    console.log(`\n✨ Final hierarchy: ${topLevelNodes.length} top-level nodes`)
    topLevelNodes.forEach((node) => {
      console.log(`   - ${node.name} (${node.subnodes.length} subnodes)`)
    })

    res.json({
      success: true,
      technology,
      roadmapId: roadmap._id.toString(),
      nodes: topLevelNodes,
      nodeCount: topLevelNodes.length,
      totalNodesInDB: nodes.length,
    })
  } catch (err) {
    console.error("❌ Roadmap generation error:", err)
    res.status(500).json({ error: "Failed to fetch or generate roadmap", details: err.message })
  }
})

// ===== Roadmap Progress Tracking =====
// app.post("/api/roadmap/node/visit", async (req, res) => {
//   const { nodeId, technology } = req.body
//   try {
//     const userId = req.body.userId || "anonymous" // Get from auth middleware in production
//     await Node.findByIdAndUpdate(nodeId, { $addToSet: { visitedBy: userId } }, { new: true })
//     res.json({ success: true, message: "Node marked as visited" })
//   } catch (err) {
//     console.error("Error marking node as visited:", err)
//     res.status(500).json({ error: "Failed to mark node as visited" })
//   }
// })

app.post("/api/roadmap/node/visit", protect, async (req, res) => {
  const { nodeId, technology } = req.body;
  const userId = req.user._id; // ✅ Automatically from JWT cookie

  if (!nodeId) return res.status(400).json({ error: "Missing nodeId" });

  try {
    const result = await Node.findByIdAndUpdate(
      nodeId,
      { $addToSet: { visitedBy: userId } },
      { new: true }
    );
    if (!result) return res.status(404).json({ error: "Node not found" });

    res.json({ success: true, message: "Node marked as visited", result });
  } catch (err) {
    console.error("❌ Error marking node as visited:", err);
    res.status(500).json({ error: err.message });
  }
});



// ===== Get User Progress =====
app.get("/api/roadmap/:technology/progress", async (req, res) => {
  const { technology } = req.params
  try {
    const userId = req.body.userId || "anonymous"
    const visitedNodes = await Node.find({
      technology,
      visitedBy: userId,
    }).lean()

    const totalNodes = await Node.countDocuments({ technology })
    const visitedCount = visitedNodes.length
    const progressPercentage = Math.round((visitedCount / totalNodes) * 100)

    res.json({
      technology,
      totalNodes,
      visitedCount,
      progressPercentage,
      visitedNodeIds: visitedNodes.map((n) => n._id),
    })
  } catch (err) {
    console.error("Error getting progress:", err)
    res.status(500).json({ error: "Failed to get progress" })
  }
})

// ===== Existing CampusCore Routes =====
app.use("/api/auth", authRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/qna", qnaRoutes)
app.use("/api/leaderboard", leaderboardRoutes)
app.use("/api/quiz", quizRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/user", userRoutes)

// ===== Start Server =====
const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || "localhost"

app.listen(PORT, () => {
  console.log(`\n✅ Unified Server running at http://${HOST}:${PORT}`)
})
