"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { requireAuth } from "@/utils/protectRoute"
import {
  BookOpen,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Eye,
  Search,
  SkipForward,
} from "lucide-react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
// import { adminService } from "@/lib/services/adminService"

export default function AdminDashboard() {
  const [flaggedReplies, setFlaggedReplies] = useState([])
  const [pendingNotes, setPendingNotes] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [summary, setSummary] = useState({ totalApproved: 0 })
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [filterScore, setFilterScore] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    requireAuth("admin")
  }, [])

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/notes/approved-by-topic", {
          credentials: "include",
        });
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      }
    };

    fetchAnalytics();
  }, []);


  // const fetchDashboardData = async () => {
  //   setLoading(true)
  //   try {
  //     const [flaggedData, notesData, analyticsData, summaryData] = await Promise.all([
  //       adminService.getFlaggedReplies(),
  //       adminService.getPendingNotes(),
  //       adminService.getNotesByTopic(),
  //       adminService.getDashboardSummary(),
  //     ])

  //     setFlaggedReplies(flaggedData || [])
  //     setPendingNotes(notesData || [])
  //     setAnalytics(analyticsData || [])
  //     setSummary(summaryData || {})
  //   } catch (error) {
  //     console.error("Failed to fetch dashboard data:", error)
  //     // Set mock data for demo
  //     setFlaggedReplies([
  //       {
  //         _id: "qna1",
  //         question: "How to learn Machine Learning?",
  //         replies: [
  //           {
  //             _id: "reply1",
  //             text: "This is a toxic comment with inappropriate language",
  //             sentimentScore: 0.82,
  //             analysis: {
  //               flagged: true,
  //               score: 0.82,
  //               labels: [
  //                 { label: "toxicity", score: 0.82 },
  //                 { label: "insult", score: 0.71 },
  //               ],
  //             },
  //             repliedBy: { name: "Anonymous User" },
  //             createdAt: new Date(),
  //           },
  //         ],
  //       },
  //     ])

  //     setPendingNotes([
  //       {
  //         _id: "post1",
  //         title: "Advanced Data Structures Guide",
  //         description:
  //           "Comprehensive guide covering trees, graphs, and advanced algorithms. This guide includes practical examples and implementations in multiple programming languages.",
  //         subject: "Data Structures",
  //         semester: "3rd",
  //         createdBy: { name: "John Doe" },
  //         createdAt: new Date(),
  //       },
  //       {
  //         _id: "post2",
  //         title: "Database Design Best Practices",
  //         description:
  //           "Learn about normalization, indexing, and optimization techniques for database design. Includes case studies and real-world examples.",
  //         subject: "Database Management",
  //         semester: "4th",
  //         createdBy: { name: "Jane Smith" },
  //         createdAt: new Date(),
  //       },
  //     ])

  //     setAnalytics([
  //       { topic: "Data Structures", approved: 45 },
  //       { topic: "Algorithms", approved: 38 },
  //       { topic: "DBMS", approved: 52 },
  //       { topic: "OS", approved: 35 },
  //       { topic: "Networks", approved: 28 },
  //       { topic: "ML", approved: 41 },
  //     ])

  //     setSummary({
  //       totalApproved: 239,
  //       totalFlagged: 12,
  //       totalPending: 8,
  //       approvalRate: "94.5%",
  //     })
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // define these helper functions OUTSIDE fetchDashboardData
  const getFlaggedReplies = async () => {
    const res = await fetch("http://localhost:5000/api/admin/flagged-replies", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch flagged replies");
    return res.json();
  };

  const deleteFlaggedReply = async (qnaId, replyId) => {
    const res = await fetch(
      `http://localhost:5000/api/admin/flagged-replies/${qnaId}/${replyId}`,
      { method: "DELETE", credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to delete flagged reply");
    return res.json();
  };

  const ignoreFlaggedReply = async (qnaId, replyId) => {
    const res = await fetch(
      `http://localhost:5000/api/admin/flagged-replies/${qnaId}/${replyId}/ignore`,
      { method: "PATCH", credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to ignore flagged reply");
    return res.json();
  };

  // now your main fetchDashboardData focuses only on dashboard metrics
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [approvedRes, pendingRes, flaggedRes, approvalRes, flaggedRepliesData, pendingNotes] =
        await Promise.all([
          fetch("http://localhost:5000/api/posts/approved/count", { credentials: "include" }),
          fetch("http://localhost:5000/api/posts/pending/count", { credentials: "include" }),
          fetch("http://localhost:5000/api/qna/flagged/count", { credentials: "include" }),
          fetch("http://localhost:5000/api/posts/approval/stats", { credentials: "include" }),
          getFlaggedReplies(),
          fetch("http://localhost:5000/api/admin/pending-notes", {
            credentials: "include",
          })
        ]);

      const [approvedData, pendingData, flaggedData, approvalData, PendingnotesData] = await Promise.all([
        approvedRes.json(),
        pendingRes.json(),
        flaggedRes.json(),
        approvalRes.json(),
        pendingNotes.json()
      ]);

      // now set all fetched values into state
      setFlaggedReplies(flaggedRepliesData || []);
      setPendingNotes(PendingnotesData || []);
      setSummary({
        totalApproved: approvalData.totalApproved || 0,
        totalPending: approvalData.totalPending || 0,
        totalFlagged: flaggedData.totalFlagged || 0,
        approvalRate: approvalData.approvalRate || "0%",
      });
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteReply = async (qnaId, replyId) => {
    try {
      await deleteFlaggedReply(qnaId, replyId);
      setFlaggedReplies((prev) =>
        prev
          .map((qna) => ({
            ...qna,
            replies: qna.replies.filter((r) => r._id !== replyId),
          }))
          .filter((qna) => qna.replies.length > 0)
      );
    } catch (error) {
      console.error("Failed to delete reply:", error);
    }
  };

  const handleIgnoreReply = async (qnaId, replyId) => {
    try {
      await ignoreFlaggedReply(qnaId, replyId);
      setFlaggedReplies((prev) =>
        prev
          .map((qna) => ({
            ...qna,
            replies: qna.replies.filter((r) => r._id !== replyId),
          }))
          .filter((qna) => qna.replies.length > 0)
      );
    } catch (error) {
      console.error("Failed to ignore reply:", error);
    }
  };



  // const handleDeleteReply = async (qnaId, replyId) => {
  //   try {
  //     await adminService.deleteFlaggedReply(qnaId, replyId)
  //     setFlaggedReplies((prev) =>
  //       prev
  //         .map((qna) => ({
  //           ...qna,
  //           replies: qna.replies.filter((r) => r._id !== replyId),
  //         }))
  //         .filter((qna) => qna.replies.length > 0),
  //     )
  //     setSuccessMessage("Reply deleted successfully")
  //     setTimeout(() => setSuccessMessage(""), 3000)
  //   } catch (error) {
  //     console.error("Failed to delete reply:", error)
  //   }
  // }

  // const handleIgnoreReply = async (qnaId, replyId) => {
  //   try {
  //     await adminService.ignoreFlaggedReply(qnaId, replyId)
  //     setFlaggedReplies((prev) =>
  //       prev
  //         .map((qna) => ({
  //           ...qna,
  //           replies: qna.replies.filter((r) => r._id !== replyId),
  //         }))
  //         .filter((qna) => qna.replies.length > 0),
  //     )
  //     setSuccessMessage("Reply marked as ignored")
  //     setTimeout(() => setSuccessMessage(""), 3000)
  //   } catch (error) {
  //     console.error("Failed to ignore reply:", error)
  //   }
  // }

  // const handleApproveNote = async (noteId) => {
  //   try {
  //     await adminService.approveNote(noteId)
  //     setPendingNotes((prev) => prev.filter((note) => note._id !== noteId))
  //     setSuccessMessage("Note approved successfully")
  //     setTimeout(() => setSuccessMessage(""), 3000)
  //   } catch (error) {
  //     console.error("Failed to approve note:", error)
  //   }
  // }

  // const handleDisapproveNote = async (noteId) => {
  //   try {
  //     await adminService.disapproveNote(noteId)
  //     setPendingNotes((prev) => prev.filter((note) => note._id !== noteId))
  //     setSuccessMessage("Note rejected successfully")
  //     setTimeout(() => setSuccessMessage(""), 3000)
  //   } catch (error) {
  //     console.error("Failed to reject note:", error)
  //   }
  // }
  const handleApproveNote = async (noteId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/notes/${noteId}/approve`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to approve note");

      const data = await res.json();

      // ✅ Remove the approved note from pending list
      setPendingNotes((prev) => prev.filter((note) => note._id !== noteId));

      setSuccessMessage("Note approved successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to approve note:", error);
    }
  };

  const handleDisapproveNote = async (noteId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/notes/${noteId}/reject`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to reject note");

      const data = await res.json();

      // ✅ Remove the rejected note from pending list
      setPendingNotes((prev) => prev.filter((note) => note._id !== noteId));

      setSuccessMessage("Note rejected successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to reject note:", error);
    }
  };


  const filteredReplies = flaggedReplies.filter((qna) => {
    return qna.replies.some((reply) => {
      const matchesScore =
        filterScore === "all" ||
        (filterScore === "high" && reply.sentimentScore >= 0.8) ||
        (filterScore === "low" && reply.sentimentScore < 0.8)
      const matchesSearch =
        qna.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reply.text.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesScore && matchesSearch
    })
  })

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  const getToxicityColor = (score) => {
    if (score >= 0.8) return "bg-red-100 text-red-800"
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800"
    return "bg-orange-100 text-orange-800"
  }

  const getToxicityBadgeColor = (score) => {
    if (score >= 0.8) return "text-red-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-orange-600"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">CampusCore</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">User Dashboard</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost">Logout</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage flagged content, approve notes, and view analytics</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Approved Notes</p>
                  <p className="text-2xl font-bold text-blue-600">{summary?.totalApproved || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Notes</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary?.totalPending || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Flagged Replies</p>
                  <p className="text-2xl font-bold text-red-600">{summary?.totalFlagged || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approval Rate</p>
                  <p className="text-2xl font-bold text-green-600">{summary?.approvalRate || "0%"}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Flagged Replies Section */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Flagged Replies Management</h2>
                <p className="text-gray-600">Review and manage potentially toxic or inappropriate replies</p>
              </div>

              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search questions or replies..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={filterScore === "all" ? "default" : "outline"}
                        onClick={() => setFilterScore("all")}
                        className={filterScore === "all" ? "" : "bg-transparent"}
                      >
                        All
                      </Button>
                      <Button
                        variant={filterScore === "high" ? "default" : "outline"}
                        onClick={() => setFilterScore("high")}
                        className={filterScore === "high" ? "bg-red-600 hover:bg-red-700" : "bg-transparent"}
                      >
                        High Toxicity
                      </Button>
                      <Button
                        variant={filterScore === "low" ? "default" : "outline"}
                        onClick={() => setFilterScore("low")}
                        className={filterScore === "low" ? "bg-orange-600 hover:bg-orange-700" : "bg-transparent"}
                      >
                        Low Toxicity
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flagged Replies Cards */}
              {filteredReplies.length > 0 ? (
                <div className="grid gap-6">
                  {filteredReplies.map((qna) =>
                    qna.replies
                      .filter((reply) => {
                        const hasAnalysisOrFlag = reply.analysis || reply.flagged === true;
                        const matchesScore =
                          filterScore === "all" ||
                          (filterScore === "high" && reply.sentimentScore >= 0.8) ||
                          (filterScore === "low" && reply.sentimentScore < 0.8)
                        const matchesSearch =
                          qna.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          reply.text.toLowerCase().includes(searchTerm.toLowerCase())
                        return hasAnalysisOrFlag && matchesScore && matchesSearch
                      })
                      .map((reply) => (
                        <Card key={reply._id} className="border-l-4 border-l-red-500">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg mb-2">Question</CardTitle>
                                <p className="text-gray-700 font-medium">{qna.question}</p>
                              </div>
                              <Badge className={getToxicityColor(reply.sentimentScore)}>
                                Score: {(reply.sentimentScore * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Flagged Reply */}
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                              <h4 className="font-semibold text-gray-900 mb-2">Flagged Reply:</h4>
                              <p className="text-gray-700">{reply.text}</p>
                            </div>

                            {/* Sentiment Score */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">Sentiment Score</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${reply.sentimentScore >= 0.8 ? "bg-red-600" : reply.sentimentScore >= 0.6 ? "bg-yellow-600" : "bg-orange-600"}`}
                                      style={{ width: `${reply.sentimentScore * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className={`font-semibold ${getToxicityBadgeColor(reply.sentimentScore)}`}>
                                    {(reply.sentimentScore * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>

                              {/* Toxicity Labels */}
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">Toxicity Categories</p>
                                <div className="flex flex-wrap gap-1">
                                  {reply.analysis?.labels?.slice(0, 3).map((label, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {label.label}: {(label.score * 100).toFixed(0)}%
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Full Analysis Report */}
                            <details className="bg-gray-50 p-3 rounded-lg cursor-pointer">
                              <summary className="font-semibold text-gray-900 flex items-center space-x-2">
                                <Eye className="h-4 w-4" />
                                <span>View Full Analysis Report</span>
                              </summary>
                              <div className="mt-3 space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  {reply.analysis?.labels?.map((label, idx) => (
                                    <div key={idx} className="flex justify-between">
                                      <span className="text-gray-600">{label.label}:</span>
                                      <span className="font-semibold">{(label.score * 100).toFixed(1)}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </details>

                            {/* Reply Metadata */}
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center space-x-4">
                                <span>By: {reply.repliedBy?.name || "Anonymous"}</span>
                                <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                              <Button
                                onClick={() => handleDeleteReply(qna._id, reply._id)}
                                variant="destructive"
                                className="flex-1"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Reply
                              </Button>
                              <Button
                                onClick={() => handleIgnoreReply(qna._id, reply._id)}
                                variant="outline"
                                className="flex-1 bg-transparent"
                              >
                                <SkipForward className="h-4 w-4 mr-2" />
                                Ignore Flag
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )),
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Flagged Replies</h3>
                    <p className="text-gray-600">All replies are clean and safe. Great job moderating!</p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Notes Approval Section */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Notes Approval</h2>
                <p className="text-gray-600">Review and approve or reject pending study notes</p>
              </div>

              {pendingNotes.length > 0 ? (
                <div className="grid gap-6">
                  {pendingNotes.map((note) => (
                    <Card key={note._id} className="border-l-4 border-l-yellow-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">{note.title}</CardTitle>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Badge variant="outline">{note.subject}</Badge>
                              <Badge variant="outline">{note.semester} Sem</Badge>
                            </div>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Preview */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Content Preview</h4>
                          <p className="text-gray-700 line-clamp-3">{note.description}</p>
                        </div>

                        {/* Author & Date */}
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="space-y-1">
                            <p>
                              <span className="font-medium">Author:</span> {note.createdBy?.name || "Unknown"}
                            </p>
                            <p>
                              <span className="font-medium">Submitted:</span>{" "}
                              {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            onClick={() => handleApproveNote(note._id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleDisapproveNote(note._id)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Disapprove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Notes</h3>
                    <p className="text-gray-600">All submitted notes have been reviewed and approved!</p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Analytics Section */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Reports</h2>
                <p className="text-gray-600">View insights and statistics about platform activity</p>
              </div>

              {/* Full-Width Bar Chart - Notes by Topic */}
              <div className="w-full">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Approved Notes by Topic</span>
                    </CardTitle>
                    <CardDescription>
                      Distribution of approved notes across subjects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics && analytics.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analytics} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="topic" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="approved" fill="#3b82f6" barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-80 flex items-center justify-center text-gray-500">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>


              {/* Summary Statistics */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Detailed Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Content Moderation</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Flagged Replies:</span>
                          <span className="font-semibold text-red-600">{summary?.totalFlagged || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Reviewed:</span>
                          <span className="font-semibold text-green-600">
                            {summary?.totalFlagged ? Math.floor(summary.totalFlagged * 0.75) : 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Pending Review:</span>
                          <span className="font-semibold text-yellow-600">
                            {summary?.totalFlagged ? Math.ceil(summary.totalFlagged * 0.25) : 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Content Approval</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Submitted:</span>
                          <span className="font-semibold">
                            {(summary?.totalApproved || 0) + (summary?.totalPending || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Approved:</span>
                          <span className="font-semibold text-green-600">{summary?.totalApproved || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Approval Rate:</span>
                          <span className="font-semibold text-blue-600">{summary?.approvalRate || "0%"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
