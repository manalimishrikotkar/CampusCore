"use client"
import { useState, useCallback, useEffect ,useRef} from "react"
import axios from "axios"
import Link from "next/link"
import {
  BookOpen,
  X,
  CheckCircle,
  Lock,
  AlertCircle,
  ChevronRight,
  Download,
  Share2,
  RotateCcw,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  Handle,
  Position,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"

// Custom Node Component with enhanced styling
// const CustomNode = ({ data, id, isVisited, onNodeClick }) => {
//   const [isHovered, setIsHovered] = useState(false)

//   return (
//     <div
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       onClick={() => {
//         onNodeClick(id, data)
//       }}
//       style={{
//         cursor: "pointer",
//         transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
//       }}
//     >
//       <Handle type="target" position={Position.Top}   style={{
//     pointerEvents: "none", // disables click interception
//   }} />
//       <div
//         style={{
//           background: data.background || "#fbbf24",
//           color: data.color || "#1f2937",
//           padding: data.padding || "12px 16px",
//           borderRadius: data.borderRadius || "8px",
//           width: data.width || "200px",
//           textAlign: "center",
//           fontSize: data.fontSize || "14px",
//           fontWeight: "600",
//           border: isVisited ? "2px solid #10b981" : `2px solid ${data.borderColor || "#f59e0b"}`,
//           boxShadow: isHovered
//             ? `0 8px 24px rgba(0, 0, 0, 0.15), inset 0 0 0 2px ${data.hoverBorder || "#fbbf24"}`
//             : "0 4px 12px rgba(0, 0, 0, 0.1)",
//           position: "relative",
//           transform: isHovered ? "scale(1.05) translateY(-4px)" : "scale(1)",
//           opacity: isVisited ? 0.8 : 1,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: "8px",
//           minHeight: "44px",
//         }}
//       >
//         {isVisited && <CheckCircle size={16} color="#10b981" />}
//         <span>{data.label}</span>
//       </div>
//       <Handle type="source" position={Position.Bottom} style={{
//     pointerEvents: "none", // same here
//   }}/>
//     </div>
//   )
// }

const CustomNode = ({ data, id, isVisited, onNodeClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const contentRef = useRef(null);

  /**
   * Capture-phase click handler
   * This ensures clicks on the node body trigger `onNodeClick`
   * while clicks on handles still work for connections.
   */
  const handleClickCapture = (e) => {
    // Check if the click happened inside the node content area
    if (contentRef.current && contentRef.current.contains(e.target)) {
      e.stopPropagation(); // Prevent ReactFlow from swallowing the event
      onNodeClick?.(id, data); // Safely call handler if provided
    }
  };

  return (
    // === Wrapper ===
    // Listens to clicks during the capture phase
    <div
      onClickCapture={handleClickCapture}
      style={{
        position: "relative",
        pointerEvents: "auto", // allows click capture
      }}
    >
      {/* === Top Handle === */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "#111",
          width: 10,
          height: 10,
          borderRadius: "50%",
          zIndex: 3,
          pointerEvents: "auto", // keeps handle interactive for edge connections
        }}
      />

      {/* === Node Body (Clickable) === */}
      <div
        ref={contentRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          pointerEvents: "auto", // enable click on node body
          background: data.background || "#fbbf24",
          color: data.color || "#1f2937",
          padding: data.padding || "12px 16px",
          borderRadius: data.borderRadius || "8px",
          width: data.width || "200px",
          textAlign: "center",
          fontSize: data.fontSize || "14px",
          fontWeight: "600",
          border: isVisited
            ? "2px solid #10b981"
            : `2px solid ${data.borderColor || "#f59e0b"}`,
          boxShadow: isHovered
            ? `0 8px 24px rgba(0,0,0,0.15), inset 0 0 0 2px ${
                data.hoverBorder || "#fbbf24"
              }`
            : "0 4px 12px rgba(0,0,0,0.1)",
          transform: isHovered ? "scale(1.05) translateY(-4px)" : "scale(1)",
          opacity: isVisited ? 0.85 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          minHeight: "44px",
          cursor: "pointer",
          transition: "all 0.25s ease",
          position: "relative",
          zIndex: 2,
          userSelect: "none",
        }}
      >
        {isVisited && <CheckCircle size={16} color="#10b981" />}
        <span>{data.label}</span>
      </div>

      {/* === Bottom Handle === */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "#111",
          width: 10,
          height: 10,
          borderRadius: "50%",
          zIndex: 3,
          pointerEvents: "auto", // allow edge creation
        }}
      />
    </div>
  );
}

const RoadmapContent = () => {
  const { setCenter, getZoom, fitView } = useReactFlow()
  const [technology, setTechnology] = useState("")
  const [loading, setLoading] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [visitedNodes, setVisitedNodes] = useState(new Set())
  const [nodeDetails, setNodeDetails] = useState({})
  const [roadmapGenerated, setRoadmapGenerated] = useState(false)
  const [progressPercentage, setProgressPercentage] = useState(0)

  const handleNodeClick = useCallback((nodeId, nodeData) => {
    setSelectedNode({ id: nodeId, data: nodeData })
    setVisitedNodes((prev) => new Set([...prev, nodeId]))
    markNodeAsVisited(nodeId)
  }, [])

  const markNodeAsVisited = async (nodeId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/roadmap/node/visit",
        { nodeId, technology },
        { withCredentials: true },
      )
    } catch (err) {
      console.error("Failed to mark node as visited:", err)
    }
  }

  // Calculate progress percentage
  // useEffect(() => {
  //   if (nodes.length > 0) {
  //     const percentage = Math.round((visitedNodes.size / nodes.length) * 100)
  //     setProgressPercentage(percentage)
  //   }
  // }, [visitedNodes, nodes.length])

  useEffect(() => {
  // Update progress percentage
  if (nodes.length > 0) {
    const percentage = Math.round((visitedNodes.size / nodes.length) * 100);
    setProgressPercentage(percentage);
  }

  // Focus on start node after roadmap generation
  if (roadmapGenerated && nodes.length > 0) {
    // Find start node by label or type (customize as needed)
    const startNode =
      nodes.find(
        (node) =>
          node.type === "start" ||
          node.data?.label?.toLowerCase().includes("start")
      ) || nodes[0]; // fallback: first node

    if (startNode) {
      const { x, y } = startNode.position;

      const yOffset = 150;
      
      // Smoothly center viewport on start node
      setCenter(x, y + yOffset, {
        zoom: 1, // Adjust zoom level
        // duration: 800, // Smooth animation
      });
    } else {
      // Fallback if no start node found
      fitView({ duration: 800 });
    }
  }
}, [visitedNodes, nodes.length, roadmapGenerated, nodes, setCenter, fitView]);

  const calculateOptimalLayout = (mainNodes) => {
    const newNodes = []
    const newEdges = []

    if (!mainNodes || mainNodes.length === 0) return { newNodes, newEdges }

    const nodeWidth = 200
    const nodeHeight = 60
    const verticalGap = 120
    const horizontalGap = 300

    let yPosition = 0

    mainNodes.forEach((mainNode, mainIndex) => {
      const mainNodeId = String(mainNode._id)
      const mainNodeX = 0
      const mainNodeY = yPosition

      // Add main node
      newNodes.push({
        id: mainNodeId,
        data: {
          label: mainNode.name,
          description: mainNode.description,
          background: "#2563eb",
          color: "white",
          borderColor: "#1e40af",
          hoverBorder: "#3b82f6",
          padding: "12px 16px",
          borderRadius: "8px",
          width: 220,
          fontSize: "14px",
        },
        position: { x: mainNodeX, y: mainNodeY },
        type: "custom",
      })

      // Connect main nodes sequentially
      if (mainIndex > 0) {
        const prevNodeId = String(mainNodes[mainIndex - 1]._id)
        newEdges.push({
          id: `main-${prevNodeId}-${mainNodeId}`,
          source: prevNodeId,
          target: mainNodeId,
          type: "smoothstep",
          animated: true,
          style: {
            stroke: "#3b82f6",
            strokeWidth: 3,
          },
        })
      }

      // Add subnodes in symmetric layout
      if (mainNode.subnodes && mainNode.subnodes.length > 0) {
        const subnodes = mainNode.subnodes.sort((a, b) => (a.order || 0) - (b.order || 0))
        const totalSubnodes = subnodes.length
        const subnodesPerSide = Math.ceil(totalSubnodes / 2)

        let leftCount = 0
        let rightCount = 0

        subnodes.forEach((subnode, index) => {
          const subnodeId = String(subnode._id)
          let subnodeX, subnodeY

          // Alternate left and right
          if (index % 2 === 0) {
            subnodeX = -horizontalGap
            subnodeY = mainNodeY + verticalGap + leftCount * verticalGap
            leftCount++
          } else {
            subnodeX = horizontalGap
            subnodeY = mainNodeY + verticalGap + rightCount * verticalGap
            rightCount++
          }

          newNodes.push({
            id: subnodeId,
            data: {
              label: subnode.name,
              description: subnode.description,
              background: "#fbbf24",
              color: "#78350f",
              borderColor: "#f59e0b",
              hoverBorder: "#fbbf24",
              padding: "10px 14px",
              borderRadius: "6px",
              width: 180,
              fontSize: "13px",
            },
            position: { x: subnodeX, y: subnodeY },
            type: "custom",
          })

          // Connect to main node
          newEdges.push({
            id: `${mainNodeId}-${subnodeId}`,
            source: mainNodeId,
            target: subnodeId,
            type: "smoothstep",
            animated: true,
            style: {
              stroke: "#9ca3af",
              strokeWidth: 2,
              strokeDasharray: "5, 5",
            },
          })

          // Add sub-subnodes
          if (subnode.subnodes && subnode.subnodes.length > 0) {
            const subSubnodes = subnode.subnodes.sort((a, b) => (a.order || 0) - (b.order || 0))
            subSubnodes.forEach((subSubnode, ssi) => {
              const subSubnodeId = String(subSubnode._id)
              const offsetX = subnodeX + (ssi % 2 === 0 ? -150 : 150)
              const offsetY = subnodeY + Math.floor(ssi / 2) * 80

              newNodes.push({
                id: subSubnodeId,
                data: {
                  label: subSubnode.name,
                  description: subSubnode.description,
                  background: "#dbeafe",
                  color: "#1e3a8a",
                  borderColor: "#93c5fd",
                  hoverBorder: "#3b82f6",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  width: 160,
                  fontSize: "12px",
                },
                position: { x: offsetX, y: offsetY },
                type: "custom",
              })

              newEdges.push({
                id: `${subnodeId}-${subSubnodeId}`,
                source: subnodeId,
                target: subSubnodeId,
                type: "smoothstep",
                style: {
                  stroke: "#d1d5db",
                  strokeWidth: 1.5,
                  strokeDasharray: "3, 3",
                },
              })
            })
          }
        })

        yPosition += Math.max(leftCount, rightCount) * verticalGap + verticalGap * 2
      } else {
        yPosition += verticalGap
      }
    })

    return { newNodes, newEdges }
  }

  const fetchRoadmap = async () => {
    if (!technology) {
      alert("Please enter a technology name")
      return
    }

    setLoading(true)
    setSelectedNode(null)
    setVisitedNodes(new Set())
    setNodes([])
    setEdges([])
    setRoadmapGenerated(false)

    try {
      const res = await axios.get(`http://localhost:5000/api/roadmap/${technology}`)
      const roadmapItems = Array.isArray(res.data.nodes) ? res.data.nodes : []

      if (!roadmapItems || roadmapItems.length === 0) {
        alert("No roadmap data received")
        setLoading(false)
        return
      }

      const mainNodes = roadmapItems
        .filter((item) => item.parentModel === "Roadmap")
        .sort((a, b) => (a.order || 0) - (b.order || 0))

      const { newNodes, newEdges } = calculateOptimalLayout(mainNodes)

      const newNodeDetails = {}
      const allNodes = [
        ...mainNodes,
        ...mainNodes.flatMap((n) => n.subnodes || []),
        ...mainNodes.flatMap((n) => n.subnodes?.flatMap((s) => s.subnodes || []) || []),
      ]

      allNodes.forEach((node) => {
        newNodeDetails[String(node._id)] = {
          name: node.name,
          description: node.description,
          prerequisites: node.prerequisites || [],
        }
      })

      setNodeDetails(newNodeDetails)
      setNodes(newNodes)
      setEdges(newEdges)
      setRoadmapGenerated(true)

      // Center view on first main node after a brief delay
      setTimeout(() => {
        if (mainNodes.length > 0) {
          setCenter(0, 0, { zoom: 1, duration: 500 })
        }
      }, 100)
    } catch (err) {
      console.error("Error fetching roadmap:", err)
      alert(`Failed to fetch roadmap: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    alert(`Downloading ${technology} roadmap...`)
  }

  const handleShare = () => {
    alert(`Share ${technology} roadmap...`)
  }

  const handleResetView = () => {
    if (nodes.length > 0) {
      setCenter(0, 0, { zoom: 1, duration: 500 })
    }
  }

  const nodeTypesConfig = {
    custom: (props) => <CustomNode {...props} isVisited={visitedNodes.has(props.id)} onClick={handleNodeClick} />,
  }

  return (
    <div style={{ height: "100vh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">CampusCore</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/notes" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                Notes
              </Link>
              <Link href="/roadmap" className="text-blue-600 font-medium text-sm">
                Roadmap
              </Link>
              <Link href="/qna" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                Q&A
              </Link>
              <Link href="/leaderboard" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                Leaderboard
              </Link>
              <Link href="/services" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
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
              padding: "12px 14px",
              flex: 1,
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              fontFamily: "inherit",
              transition: "border-color 0.2s",
            }}
          />
          <button
            onClick={fetchRoadmap}
            disabled={loading || !technology}
            style={{
              padding: "12px 24px",
              background: loading ? "#9ca3af" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Loading..." : "Generate"}
          </button>
        </div>
      </div>

      {/* Technology Card */}
      {roadmapGenerated && (
        <div
          style={{
            padding: "24px 20px",
            background: "white",
            borderBottom: "1px solid #e5e7eb",
            animation: "slideDown 0.4s ease-out",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

            

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", gap: "12px" }}>
                <div
                  style={{
                    background: "#fbbf24",
                    color: "#78350f",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {progressPercentage}% DONE
                </div>
                <span style={{ color: "#6b7280", fontSize: "14px", display: "flex", alignItems: "center" }}>
                  {visitedNodes.size} of {nodes.length} completed
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleDownload}
                  style={{
                    padding: "10px 16px",
                    background: "#fbbf24",
                    color: "#1f2937",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#f59e0b")}
                  onMouseLeave={(e) => (e.target.style.background = "#fbbf24")}
                >
                  <Download size={8} />
                  Download
                </button>
                <button
                  onClick={handleShare}
                  style={{
                    padding: "10px 16px",
                    background: "#fbbf24",
                    color: "#1f2937",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#f59e0b")}
                  onMouseLeave={(e) => (e.target.style.background = "#fbbf24")}
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: "16px" }}>
              <div
                style={{
                  height: "6px",
                  background: "#e5e7eb",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "#10b981",
                    width: `${progressPercentage}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <>
  {/* Main Content */}
  <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
    {/* React Flow Area */}
    <div style={{ flex: 1, position: "relative", background: "#f9fafb" }}>
      {roadmapGenerated && nodes.length > 0 ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
          onNodeClick={(event, node) => handleNodeClick(node.id, node.data)}
          nodeTypes={nodeTypesConfig}
          panOnDrag
          panOnScroll
          zoomOnScroll
          zoomOnPinch
          fitView={true}
          minZoom={1}
          maxZoom={3}
          elementsSelectable={true}
        >
          {/* <MiniMap /> */}
          <Controls />
          <Background color="#d1d5db" gap={5} size={1} />

          {/* Floating Toolbar */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "8px",
              display: "flex",
              gap: "8px",
              zIndex: 10,
            }}
          >
            <button
              onClick={handleResetView}
              title="Reset View"
              style={{
                padding: "10px",
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#2563eb")}
              onMouseLeave={(e) => (e.target.style.background = "#f3f4f6")}
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </ReactFlow>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#9ca3af",
            textAlign: "center",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Zap size={48} opacity={0.5} />
          <p style={{ fontSize: "18px", fontWeight: "500", margin: 0 }}>
            Enter a technology name to generate a roadmap
          </p>
        </div>
      )}
    </div>
  </div>

  {/* Sidebar Overlay */}
  {selectedNode && (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "400px",
        height: "100vh",
        background: "white",
        borderLeft: "1px solid #e5e7eb",
        boxShadow: "-4px 0 16px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        zIndex: 999,
        transition: "transform 0.3s ease-in-out",
      }}
    >
      {/* Sidebar Header */}
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
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#111" }}>
            Learning Details
          </h3>
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
            color: "#6b7280",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#f3f4f6")}
          onMouseLeave={(e) => (e.target.style.background = "none")}
        >
          <X size={20} />
        </button>
      </div>

      {/* Sidebar Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "800",
            color: "#111",
            margin: "0 0 12px 0",
            wordWrap: "break-word",
          }}
        >
          {selectedNode.data.label}
        </h2>

        {/* Description */}
        <div style={{ marginBottom: "24px" }}>
          <h4
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#6b7280",
              margin: "0 0 8px 0",
              textTransform: "uppercase",
            }}
          >
            📚 Description
          </h4>
          <p
            style={{
              fontSize: "14px",
              lineHeight: "1.6",
              color: "#4b5563",
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {selectedNode.data.description || "No description available"}
          </p>
        </div>

        {/* Prerequisites */}
        {nodeDetails[selectedNode.id]?.prerequisites?.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h4
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#6b7280",
                margin: "0 0 12px 0",
                textTransform: "uppercase",
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
                    gap: "10px",
                    padding: "12px",
                    background: "#fef3c7",
                    borderLeft: "4px solid #f59e0b",
                    borderRadius: "6px",
                    fontSize: "13px",
                    color: "#92400e",
                    fontWeight: "500",
                  }}
                >
                  <Lock size={14} />
                  {prereq}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion Badge */}
        <div
          style={{
            padding: "12px 16px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#166534",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          <CheckCircle size={16} />✓ Marked as visited
        </div>
      </div>

      {/* Sidebar Footer */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid #e5e7eb",
          background: "#f9fafb",
        }}
      >
        <button
          onClick={() => alert(`Start learning: ${selectedNode.data.label}`)}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#1d4ed8")}
          onMouseLeave={(e) => (e.target.style.background = "#2563eb")}
        >
          <ChevronRight size={16} />
          Start Learning
        </button>
      </div>
    </div>
  )}
</>


      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .react-flow__minimap {
          background-color: #f9fafb !important;
          border-radius: 8px;
          border: 1px solid #e5e7eb !important;
        }

        .react-flow__controls {
          background-color: white !important;
          border-radius: 8px;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }

        .react-flow__controls button {
          background-color: white !important;
          border-bottom: 1px solid #e5e7eb !important;
        }

        .react-flow__controls button:hover {
          background-color: #f3f4f6 !important;
        }
      `}</style>
    </div>
  )
}

const RoadmapPage = () => {
  return (
    <ReactFlowProvider>
      <RoadmapContent />
    </ReactFlowProvider>
  );
};


export default RoadmapPage
