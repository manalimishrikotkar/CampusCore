"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, MessageCircle, Search, Plus, ThumbsUp, ThumbsDown, Reply, Clock, User, Filter } from "lucide-react"

export default function QnAPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showAskForm, setShowAskForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
  })
  const [questions, setQuestions] = useState([]); // ⬅️ replace the hardcoded list
  const [replies, setReplies] = useState({});
  const [showReplyBox, setShowReplyBox] = useState({});
  const [replyText, setReplyText] = useState({});


  function timeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const r = [
      [31536000, "year"],
      [2592000, "month"],
      [86400, "day"],
      [3600, "hour"],
      [60, "minute"],
      [1, "second"]
    ];
    for (let [unit, label] of r) {
      const interval = Math.floor(seconds / unit);
      if (interval >= 1) return `${interval} ${label}${interval > 1 ? "s" : ""} ago`;
    }
    return "just now";
  }


  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("http://localhost:5000/api/qna");
        const data = await res.json();

        // Transform backend schema to UI format
        const formatted = data.map((qna) => ({
          id: qna._id,
          _id :qna._id,
          title: qna.question,
          content: qna.question_details,
          category: qna.category,
          tags: qna.tags.split(",").map(tag => tag.trim()),
          author: qna.author || "Anonymous",
          createdAt: qna.createdAt,
          replies: qna.replies || [],
        }));

        setQuestions(formatted);
        const fetchReplies = async (questionId) => {
          const res = await fetch(`http://localhost:5000/api/qna/${questionId}/replies`);
          const data = await res.json();
          setReplies(prev => ({ ...prev, [questionId]: data }));
        };

        // Auto-fetch replies for each question
        formatted.forEach(q => fetchReplies(q.id));

      } catch (error) {
        console.error("Failed to fetch questions:", error);
      }
    }

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions.length === 0) return;

    const enriched = questions.map((q) => ({
      ...q,
      timeAgo: timeSince(new Date(q.createdAt)),
      answers: q.replies?.length || 0,
      isAnswered: !!(q.replies?.length),
      upvotes: q.replies?.reduce((acc, r) => acc + (r.upvotes || 0), 0),
      downvotes: 0,
    }));

    setQuestions(enriched);
  }, [questions.length]);




  const categories = ["All Categories", "Academic", "Technical", "Career", "Campus Life", "General"]

  // const questions = [
  //   {
  //     id: 1,
  //     title: "How to implement a binary search tree efficiently?",
  //     content:
  //       "I'm struggling with implementing BST operations like insertion, deletion, and traversal. Can someone explain the best approach with time complexity analysis?",
  //     category: "Technical",
  //     tags: ["Data Structures", "BST", "Algorithms"],
  //     author: "Anonymous User #1234",
  //     timeAgo: "2 hours ago",
  //     upvotes: 15,
  //     downvotes: 2,
  //     answers: 8,
  //     isAnswered: true,
  //     views: 234,
  //   },
  //   {
  //     id: 2,
  //     title: "Best resources for preparing for placement interviews?",
  //     content:
  //       "I'm in my final year and looking for comprehensive resources to prepare for technical interviews. What books, websites, or courses would you recommend?",
  //     category: "Career",
  //     tags: ["Placement", "Interview", "Preparation"],
  //     author: "Anonymous User #5678",
  //     timeAgo: "4 hours ago",
  //     upvotes: 28,
  //     downvotes: 1,
  //     answers: 12,
  //     isAnswered: true,
  //     views: 456,
  //   },
  //   {
  //     id: 3,
  //     title: "Database normalization vs denormalization - when to use what?",
  //     content:
  //       "I understand the concepts of normalization and denormalization, but I'm confused about when to apply each approach in real-world scenarios.",
  //     category: "Academic",
  //     tags: ["Database", "Normalization", "Design"],
  //     author: "Anonymous User #9012",
  //     timeAgo: "6 hours ago",
  //     upvotes: 22,
  //     downvotes: 3,
  //     answers: 6,
  //     isAnswered: true,
  //     views: 189,
  //   },
  //   {
  //     id: 4,
  //     title: "How to balance studies with extracurricular activities?",
  //     content:
  //       "I'm finding it difficult to manage my time between academics and participating in college events. Any tips for better time management?",
  //     category: "Campus Life",
  //     tags: ["Time Management", "Studies", "Activities"],
  //     author: "Anonymous User #3456",
  //     timeAgo: "8 hours ago",
  //     upvotes: 19,
  //     downvotes: 0,
  //     answers: 15,
  //     isAnswered: true,
  //     views: 312,
  //   },
  //   {
  //     id: 5,
  //     title: "React hooks vs class components - which is better?",
  //     content:
  //       "I'm learning React and confused about when to use hooks vs class components. What are the advantages and disadvantages of each approach?",
  //     category: "Technical",
  //     tags: ["React", "JavaScript", "Web Development"],
  //     author: "Anonymous User #7890",
  //     timeAgo: "12 hours ago",
  //     upvotes: 31,
  //     downvotes: 4,
  //     answers: 9,
  //     isAnswered: true,
  //     views: 278,
  //   },
  //   {
  //     id: 6,
  //     title: "Tips for effective group study sessions?",
  //     content:
  //       "Our study group often gets distracted and doesn't seem productive. What are some strategies to make group study sessions more effective?",
  //     category: "Academic",
  //     tags: ["Study Tips", "Group Study", "Productivity"],
  //     author: "Anonymous User #2468",
  //     timeAgo: "1 day ago",
  //     upvotes: 14,
  //     downvotes: 1,
  //     answers: 11,
  //     isAnswered: true,
  //     views: 167,
  //   },
  // ]

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || question.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleAskQuestion = (e) => {
    e.preventDefault()
    // Simulate posting question
    console.log("New question:", newQuestion)
    setShowAskForm(false)
    setNewQuestion({ title: "", content: "", category: "", tags: "" })
  }

  const handleReplySubmit = async (questionId) => {
    console.log("question_id", questionId);
    if (!replyText[questionId]) return;

    // const res = await fetch(`http://localhost:5000/api/qna/${questionId}/reply`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text: replyText[questionId] }),
    // });

    const res = await fetch(`http://localhost:5000/api/qna/${questionId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // ✅ REQUIRED to send cookies
    body: JSON.stringify({ text: replyText[questionId] }),
  });
    console.log("res",res);
    if (res.ok) {
      const updated = await res.json();
      setReplies(prev => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), updated.reply]
      }));
      setReplyText(prev => ({ ...prev, [questionId]: '' }));
    } else {
      alert('Reply failed');
    }
  };

  const handleUpvote = async (questionId, replyId) => {
    const voterId = "anon-1234"; // You can use a header or user id if available
    const res = await fetch(`http://localhost:5000/api/qna/${questionId}/replies/${replyId}/upvote`, {
      method: 'PATCH',
      headers: { 'x-anon-id': voterId },
    });

    if (res.ok) {
      const data = await res.json();
      setReplies(prev => ({
        ...prev,
        [questionId]: prev[questionId].map(reply =>
          reply._id === replyId ? { ...reply, upvotes: data.reply.upvotes } : reply
        )
      }));
    } else {
      alert('Already upvoted or failed');
    }
  };


  const getCategoryColor = (category) => {
    switch (category) {
      case "Academic":
        return "bg-blue-100 text-blue-800"
      case "Technical":
        return "bg-purple-100 text-purple-800"
      case "Career":
        return "bg-green-100 text-green-800"
      case "Campus Life":
        return "bg-yellow-100 text-yellow-800"
      case "General":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleQuesSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/qna", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          question: newQuestion.title,
          question_details: newQuestion.content,
          category: newQuestion.category,
          tags: newQuestion.tags,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("✅ Question posted successfully!");
        setNewQuestion({
          title: "",
          content: "",
          category: "",
          tags: "",
        });
        setShowAskForm(false);
        const res = await fetch("http://localhost:5000/api/qna");
        const newData = await res.json();
        const formatted = newData.map(/* same formatting logic as above */);
        setQuestions(formatted);
      } else {
        console.error("❌ Failed to post question:", data);
        alert("❌ Posting failed. " + (data.message || ""));
      }
    } catch (error) {
      console.error("❌ Error posting question:", error);
      alert("❌ Network error. Please try again.");
    }
  };

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
            <nav className="hidden md:flex space-x-8">
              <Link href="/notes" className="text-gray-600 hover:text-blue-600 transition-colors">
                Notes
              </Link>
              <Link href="/roadmap" className="text-gray-600 hover:text-blue-600 transition-colors">
                Roadmap
              </Link>
              <Link href="/qna" className="text-blue-600 font-medium">
                Q&A
              </Link>
              <Link href="/leaderboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                Leaderboard
              </Link>
              <Link href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">
                Services
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowAskForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ask Question
              </Button>
              <Link href="/user">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Anonymous Q&A</h1>
          <p className="text-gray-600">Ask questions anonymously and get help from the community</p>
        </div>

        {/* Ask Question Form */}
        {showAskForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ask a Question Anonymously</CardTitle>
              <CardDescription>Your identity will remain completely anonymous</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAskQuestion} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question Title</label>
                  <Input
                    placeholder="What's your question about?"
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Question Details</label>
                  <Textarea
                    placeholder="Provide more details about your question..."
                    rows={4}
                    value={newQuestion.content}
                    onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={newQuestion.category} onValueChange={(value) => setNewQuestion({ ...newQuestion, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <Input
                      placeholder="e.g., react, javascript, algorithms"
                      value={newQuestion.tags}
                      onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" onClick={handleQuesSubmit}>Post Question</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAskForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
 <div className="space-y-6">
  {filteredQuestions.map((question) => (
    <Card key={question.id} className="hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Question Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getCategoryColor(question.category)}>{question.category}</Badge>
              {question.isAnswered && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Answered
                </Badge>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
              {question.title}
            </h3>

            <p className="text-gray-600 mb-4 line-clamp-2">{question.content}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {question.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{question.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{question.timeAgo}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span>{question.views} views</span>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() =>
                    setShowReplyBox(prev => ({ ...prev, [question.id]: !prev[question.id] }))
                  }>
                    Reply
                  </Button>
                  <Reply className="h-4 w-4" />
                  <span>{question.answers} answers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replies Section */}
        {(replies[question.id] || []).map((reply, index) =>
          reply?.text ? (
            <div key={index} className="bg-gray-50 p-3 rounded-md border mt-2">
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-800">{reply.text}</p>
                <div className="flex flex-col items-center ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={() => handleUpvote(question.id, reply._id)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-gray-600">
                    {reply.upvotes || 0}
                  </span>
                </div>
              </div>
            </div>
          ) : null
        )}

        {/* Reply Textarea */}
        {showReplyBox[question.id] && (
          <div className="mt-4 ml-6">
            <Textarea
              value={replyText[question.id] || ''}
              onChange={(e) =>
                setReplyText(prev => ({ ...prev, [question.id]: e.target.value }))
              }
              placeholder="Type your reply..."
              rows={3}
            />
            <Button className="mt-2" onClick={() => handleReplySubmit(question.id)}>
              Submit Reply
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  ))}
</div>

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or be the first to ask a question.</p>
            <Button onClick={() => setShowAskForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ask First Question
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
