"use client"
import { useState, useCallback } from "react"
import axios from "axios"
import Link from "next/link"
import { BookOpen, X, CheckCircle, Lock, AlertCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"

// Custom Node Component with Click Handler
const CustomNode = ({ data, id, isVisited, onNodeClick }) => (
  <div
    onClick={() => onNodeClick(id, data)}
    style={{
      cursor: "pointer",
      transition: "all 0.3s ease",
      opacity: isVisited ? 0.7 : 1,
      transform: isVisited ? "scale(0.95)" : "scale(1)",
    }}
  >
    <Handle type="target" position={Position.Top} />
    <div
      style={{
        background: isVisited ? "#d1d5db" : data.style?.background || "#2563eb",
        color: isVisited ? "#666" : data.style?.color || "white",
        padding: data.style?.padding || "10px",
        borderRadius: data.style?.borderRadius || "8px",
        width: data.style?.width || "250px",
        textAlign: "center",
        fontSize: "13px",
        fontWeight: "500",
        border: isVisited ? "2px solid #10b981" : "1px solid #1e40af",
        boxShadow: isVisited ? "0 0 8px rgba(16, 185, 129, 0.3)" : "0 2px 5px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
        {isVisited && <CheckCircle size={14} />}
        {data.label}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
)

const App = () => {
  const [technology, setTechnology] = useState("")
  const [loading, setLoading] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [visitedNodes, setVisitedNodes] = useState(new Set())
  const [nodeDetails, setNodeDetails] = useState({})

  const handleNodeClick = useCallback((nodeId, nodeData) => {
    setSelectedNode({ id: nodeId, data: nodeData })
    // Mark as visited
    setVisitedNodes((prev) => new Set([...prev, nodeId]))
    // Persist to backend
    markNodeAsVisited(nodeId)
  }, [])

  const markNodeAsVisited = async (nodeId) => {
    try {
      await axios.post(`http://localhost:5000/api/roadmap/node/visit`, {
        nodeId,
        technology,
      })
    } catch (err) {
      console.error("Failed to mark node as visited:", err)
    }
  }

  const fetchRoadmap = async () => {
    if (!technology) return
    setLoading(true)
    setSelectedNode(null)
    setVisitedNodes(new Set())

    try {
      const res = await axios.get(`http://localhost:5000/api/roadmap/${technology}`)

      const roadmapItems = Array.isArray(res.data) ? res.data : res.data.nodes || []

      const newNodes = []
      const newEdges = []
      const newNodeDetails = {}

      const xOffset = 300
      const yOffset = 250

      const mainNodes = roadmapItems
        .filter((item) => item.parentModel === "Roadmap")
        .sort((a, b) => (a.order || 0) - (b.order || 0))

      let yCursor = 0

      function addSubnodes(subs, parentId, level, xBase, yStart) {
        const subYSpacing = 100
        const subX = xBase + xOffset
        let currentY = yStart
        let prevSiblingId = null

        const sortedSubs = [...subs].sort((a, b) => (a.order || 0) - (b.order || 0))

        for (const sub of sortedSubs) {
          const id = String(sub._id)
          const y = currentY

          // Store node details
          newNodeDetails[id] = {
            name: sub.name,
            description: sub.description,
            prerequisites: sub.prerequisites || [],
            level: level,
          }

          newNodes.push({
            id,
            data: {
              label: sub.name,
              style: {
                background: "#f9fafb",
                color: "black",
                padding: "8px",
                borderRadius: "6px",
                width: 220,
              },
            },
            position: { x: subX, y },
          })

          newEdges.push({
            id: `parent-${parentId}-${id}`,
            source: parentId,
            target: id,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#999", strokeDasharray: "5, 5" },
          })

          if (prevSiblingId) {
            newEdges.push({
              id: `seq-${prevSiblingId}-${id}`,
              source: prevSiblingId,
              target: id,
              type: "smoothstep",
              animated: true,
              style: { stroke: "#4f46e5", strokeWidth: 2 },
            })
          }

          prevSiblingId = id

          if (sub.subnodes && sub.subnodes.length > 0) {
            currentY = addSubnodes(sub.subnodes, id, level + 1, subX, currentY + subYSpacing)
          } else {
            currentY += subYSpacing
          }
        }

        return currentY
      }

      mainNodes.forEach((node, i) => {
        const id = String(node._id)
        const mainNodeY = yCursor

        // Store main node details
        newNodeDetails[id] = {
          name: node.name,
          description: node.description,
          prerequisites: node.prerequisites || [],
          level: 0,
        }

        newNodes.push({
          id,
          data: {
            label: node.name,
            style: {
              background: "#2563eb",
              color: "white",
              padding: "10px",
              borderRadius: "8px",
              width: 250,
            },
          },
          position: { x: 0, y: mainNodeY },
        })

        if (i > 0) {
          const prevId = String(mainNodes[i - 1]._id)
          newEdges.push({
            id: `${prevId}-${id}`,
            source: prevId,
            target: id,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#2563eb", strokeWidth: 2 },
          })
        }

        if (node.subnodes && node.subnodes.length > 0) {
          const lowestSubnodeY = addSubnodes(node.subnodes, id, 1, 0, mainNodeY)
          yCursor = Math.max(mainNodeY + yOffset, lowestSubnodeY + yOffset)
        } else {
          yCursor += yOffset
        }
      })

      setNodeDetails(newNodeDetails)
      setNodes(
        newNodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            onClick: handleNodeClick,
          },
        })),
      )
      setEdges(newEdges)
    } catch (err) {
      console.error(err)
      alert("Failed to fetch roadmap")
    }

    setLoading(false)
  }

  const nodeTypes = {
    default: (props) => <CustomNode {...props} isVisited={visitedNodes.has(props.id)} onNodeClick={handleNodeClick} />,
  }

  return (
    <div style={{ height: "100vh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">CampusCore</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/notes" className="text-gray-600 hover:text-blue-600 transition-colors">
                Notes
              </Link>
              <Link href="/roadmap" className="text-blue-600 font-medium">
                Roadmap
              </Link>
              <Link href="/qna" className="text-gray-600 hover:text-blue-600 transition-colors">
                Q&A
              </Link>
              <Link href="/leaderboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                Leaderboard
              </Link>
              <Link href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">
                Services
              </Link>
            </nav>
            <Link href="/user">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div style={{ padding: "16px 20px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", maxWidth: "1200px", margin: "0 auto" }}>
          <input
            type="text"
            placeholder="Search technology (e.g., Python, React, MERN Stack)"
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && fetchRoadmap()}
            style={{
              padding: "10px 14px",
              flex: 1,
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={fetchRoadmap}
            disabled={loading || !technology}
            style={{
              padding: "10px 20px",
              background: loading ? "#9ca3af" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "500",
              fontSize: "14px",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Loading..." : "Generate"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* React Flow Area */}
        <div style={{ flex: 1, position: "relative", background: "#f5f5f5" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
            onNodeClick={(event, node) => handleNodeClick(node.id, node.data)}
            nodeTypes={nodeTypes}
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

        {/* Right Sidebar */}
        <div
          style={{
            width: selectedNode ? "380px" : "0",
            background: "white",
            borderLeft: "1px solid #e5e7eb",
            overflow: "hidden",
            transition: "width 0.3s ease",
            display: "flex",
            flexDirection: "column",
            boxShadow: selectedNode ? "-2px 0 8px rgba(0,0,0,0.1)" : "none",
          }}
        >
          {selectedNode && (
            <>
              {/* Header */}
              <div
                style={{
                  padding: "20px",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#f9fafb",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle size={20} color="#10b981" />
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111" }}>Learning Details</h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#e5e7eb")}
                  onMouseLeave={(e) => (e.target.style.background = "none")}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                {/* Node Title */}
                <div style={{ marginBottom: "20px" }}>
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#111",
                      margin: "0 0 8px 0",
                      wordWrap: "break-word",
                    }}
                  >
                    {selectedNode.data.label}
                  </h2>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      background: "#f0f9ff",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      display: "inline-block",
                      marginBottom: "12px",
                    }}
                  >
                    Level {nodeDetails[selectedNode.id]?.level || 0}
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>
                    📚 Description
                  </h4>
                  <p
                    style={{
                      fontSize: "13px",
                      lineHeight: "1.6",
                      color: "#555",
                      margin: 0,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedNode.data.description || "No description available"}
                  </p>
                </div>

                {/* Prerequisites */}
                {nodeDetails[selectedNode.id]?.prerequisites &&
                  nodeDetails[selectedNode.id].prerequisites.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <h4
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#374151",
                          margin: "0 0 12px 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <AlertCircle size={16} color="#f59e0b" />
                        Prerequisites
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {nodeDetails[selectedNode.id].prerequisites.map((prereq, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "10px",
                              background: "#fef3c7",
                              borderLeft: "3px solid #f59e0b",
                              borderRadius: "4px",
                              fontSize: "13px",
                              color: "#92400e",
                            }}
                          >
                            <Lock size={14} />
                            {prereq}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Progress Indicator */}
                <div
                  style={{
                    padding: "12px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#166534",
                    fontSize: "13px",
                  }}
                >
                  <CheckCircle size={16} />
                  <span>✓ Marked as visited</span>
                </div>
              </div>

              {/* Footer CTA */}
              <div style={{ padding: "16px", borderTop: "1px solid #e5e7eb", background: "#f9fafb" }}>
                <Button
                  onClick={() => alert(`Start learning: ${selectedNode.data.label}`)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <ChevronRight size={16} />
                  Start Learning
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
