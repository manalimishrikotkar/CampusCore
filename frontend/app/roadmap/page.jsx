import { useState } from "react";
import axios from "axios";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";

const App = () => {
  const [technology, setTechnology] = useState("");
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const fetchRoadmap = async () => {
    if (!technology) return;
    setLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/roadmap/${technology}`
      );

      const roadmapItems = Array.isArray(res.data)
        ? res.data
        : res.data.nodes || [];

      const newNodes = [];
      const newEdges = [];

      const xOffset = 300; // horizontal spacing
      const yOffset = 250; // vertical spacing for main nodes

      // 1️⃣ Separate and sort main nodes (level 0)
      const mainNodes = roadmapItems
        .filter((item) => item.parentModel === "Roadmap")
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      let yCursor = 0; // Tracks the current vertical position for main nodes

      // 3️⃣ Recursive function for subnodes (MODIFIED for cleaner edges)
      // It now only connects the current node to its *immediate* parent and *previous sibling*.
      function addSubnodes(subs, parentId, level, xBase, yStart) {
        const subYSpacing = 100; // vertical spacing for subnodes
        const subX = xBase + xOffset; // New horizontal position
        let currentY = yStart; // Tracks Y position within this sub-level
        let prevSiblingId = null; // Tracks the previous node in the same level

        // Sort subnodes by 'order' property
        const sortedSubs = [...subs].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );

        for (const sub of sortedSubs) {
          const id = String(sub._id);
          const y = currentY; // Place node at current Y cursor

          newNodes.push({
            id,
            data: { label: <div title={sub.description}>{sub.name}</div> },
            position: { x: subX, y },
            style: {
              background: "#f9fafb",
              color: "black",
              padding: "8px",
              borderRadius: "6px",
              width: 220,
              border: "1px solid #ccc",
              textAlign: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            },
          });

          // Edge 1: Parent to Child Connection (MODIFIED)
          // Connect to the immediate parentId only if it's the *first* subnode
          // OR if we decide to keep the parent connection for all.
          // Let's keep Parent-to-Child for all subnodes for robust structure,
          // as per the previous logic, but ensure sequential connection too.
          newEdges.push({
            id: `parent-${parentId}-${id}`,
            source: parentId,
            target: id,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#999", strokeDasharray: "5, 5" }, // Dashed line for Parent link
          });

          // Edge 2: Sequential Sibling Connection (NEW)
          if (prevSiblingId) {
            newEdges.push({
              id: `seq-${prevSiblingId}-${id}`,
              source: prevSiblingId,
              target: id,
              type: "smoothstep",
              animated: true,
              style: { stroke: "#4f46e5", strokeWidth: 2 }, // Solid color for sequential flow
            });
          }

          // Remember this node as the previous sibling for the next iteration
          prevSiblingId = id;

          // Recurse if deeper subnodes exist, and update currentY
          if (sub.subnodes && sub.subnodes.length > 0) {
            // Recursively add children, starting from current Y position + subYSpacing
            // The return value is the Y position of the lowest node added
            currentY = addSubnodes(
              sub.subnodes,
              id,
              level + 1,
              subX,
              currentY + subYSpacing
            );
          } else {
            // If no subnodes, just increment the Y cursor
            currentY += subYSpacing;
          }
        }

        // Return the final Y cursor for the main loop or the parent call
        return currentY;
      }

      // 2️⃣ Add main nodes vertically connected (Layout logic unchanged from the fix)
      mainNodes.forEach((node, i) => {
        const id = String(node._id);
        const mainNodeY = yCursor;

        newNodes.push({
          id,
          data: { label: <div title={node.description}>{node.name}</div> },
          position: { x: 0, y: mainNodeY },
          style: {
            background: "#2563eb",
            color: "white",
            padding: "10px",
            borderRadius: "8px",
            width: 250,
            textAlign: "center",
          },
        });

        // connect sequentially (main roadmap chain)
        if (i > 0) {
          const prevId = String(mainNodes[i - 1]._id);
          newEdges.push({
            id: `${prevId}-${id}`,
            source: prevId,
            target: id,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#2563eb", strokeWidth: 2 },
          });
        }

        // Build its subnodes
        if (node.subnodes && node.subnodes.length > 0) {
          // Pass the main node's Y position as the starting point for subnodes
          const lowestSubnodeY = addSubnodes(
            node.subnodes,
            id,
            1,
            0,
            mainNodeY
          );

          // Set the Y cursor for the next main node to be *below* the lowest subnode
          // Use the greater of the original yOffset or the space taken by subnodes
          yCursor = Math.max(mainNodeY + yOffset, lowestSubnodeY + yOffset);
        } else {
          // If no subnodes, just move to the next main node position
          yCursor += yOffset;
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch roadmap");
    }

    setLoading(false);
  };

  // ... (rest of the component remains the same)
  return (
    <div style={{ height: "100vh", width: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Tech Roadmap Generator</h1>
        <input
          type="text"
          placeholder="Technology (e.g., Python)"
          value={technology}
          onChange={(e) => setTechnology(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && fetchRoadmap()}
          style={{ padding: "8px", width: "250px", marginRight: "10px" }}
        />
        <button
          onClick={fetchRoadmap}
          disabled={loading}
          style={{
            padding: "8px 15px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Generate"}
        </button>
      </div>

      {/* Scrollable React Flow container */}
      <div
        style={{
          height: "85vh",
          width: "100%",
          overflow: "auto",
          background: "#f5f5f5",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
          panOnDrag
          panOnScroll
          zoomOnScroll
          zoomOnPinch
          fitView
          minZoom={0.2}
          maxZoom={2}
          style={{ minWidth: "1800px", minHeight: "3000px" }}
        >
          <MiniMap />
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default App;
