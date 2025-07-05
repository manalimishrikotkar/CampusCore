"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Brain, Play, Clock, Trophy, Star, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function QuizPage() {
  const [selectedSubject, setSelectedSubject] = useState("all")
  const router = useRouter()

  const quizzes = [
    {
      id: 1,
      title: "Data Structures Fundamentals",
      subject: "Data Structures",
      difficulty: "Beginner",
      questions: 15,
      timeLimit: 20,
      attempts: 1250,
      averageScore: 78,
      description: "Test your knowledge of arrays, linked lists, stacks, and queues.",
      topics: ["Arrays", "Linked Lists", "Stacks", "Queues"],
    },
    {
      id: 2,
      title: "Advanced Algorithms",
      subject: "Algorithms",
      difficulty: "Advanced",
      questions: 20,
      timeLimit: 30,
      attempts: 890,
      averageScore: 65,
      description: "Challenge yourself with dynamic programming and graph algorithms.",
      topics: ["Dynamic Programming", "Graph Algorithms", "Greedy Algorithms"],
    },
    {
      id: 3,
      title: "Database Design Principles",
      subject: "Database Management",
      difficulty: "Intermediate",
      questions: 18,
      timeLimit: 25,
      attempts: 1100,
      averageScore: 72,
      description: "Master normalization, ER diagrams, and SQL optimization.",
      topics: ["Normalization", "ER Diagrams", "SQL Optimization"],
    },
    {
      id: 4,
      title: "Operating System Concepts",
      subject: "Operating Systems",
      difficulty: "Intermediate",
      questions: 22,
      timeLimit: 35,
      attempts: 950,
      averageScore: 69,
      description: "Explore process management, memory allocation, and file systems.",
      topics: ["Process Management", "Memory Management", "File Systems"],
    },
    {
      id: 5,
      title: "Network Protocols",
      subject: "Computer Networks",
      difficulty: "Advanced",
      questions: 16,
      timeLimit: 25,
      attempts: 720,
      averageScore: 63,
      description: "Deep dive into TCP/IP, routing protocols, and network security.",
      topics: ["TCP/IP", "Routing", "Network Security"],
    },
    {
      id: 6,
      title: "Software Engineering Basics",
      subject: "Software Engineering",
      difficulty: "Beginner",
      questions: 12,
      timeLimit: 15,
      attempts: 1400,
      averageScore: 81,
      description: "Learn SDLC models, testing strategies, and project management.",
      topics: ["SDLC", "Testing", "Project Management"],
    },
  ]

  const recentQuizzes = [
    { title: "Data Structures Fundamentals", score: 85, date: "2024-01-15", status: "completed" },
    { title: "Database Design Principles", score: 72, date: "2024-01-12", status: "completed" },
    { title: "Advanced Algorithms", score: 0, date: "2024-01-10", status: "in-progress" },
  ]

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
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
            <nav className="hidden md:flex space-x-8">
              <Link href="/notes" className="text-gray-600 hover:text-blue-600 transition-colors">
                Notes
              </Link>
              <Link href="/quiz" className="text-blue-600 font-medium">
                Quiz
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
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Generated Quizzes</h1>
          <p className="text-gray-600">Test your knowledge with quizzes automatically generated from uploaded notes</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Quiz */}
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Badge className="mb-3 bg-blue-600">Featured Quiz</Badge>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Structures Fundamentals</h2>
                    <p className="text-gray-600 mb-4">
                      Master the basics of arrays, linked lists, stacks, and queues with this comprehensive quiz.
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
                      <div className="flex items-center space-x-1">
                        <Brain className="h-4 w-4" />
                        <span>15 Questions</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>20 Minutes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Trophy className="h-4 w-4" />
                        <span>78% Avg Score</span>
                      </div>
                    </div>
                    <Button size="lg" onClick={() => router.push("/quiz/1")}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Quiz
                    </Button>
                  </div>
                  <div className="hidden md:block">
                    <Brain className="h-24 w-24 text-blue-600 opacity-20" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{quiz.averageScore}%</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Topics */}
                      <div className="flex flex-wrap gap-1">
                        {quiz.topics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <p className="font-semibold text-gray-900">{quiz.questions}</p>
                          <p className="text-gray-600">Questions</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{quiz.timeLimit}m</p>
                          <p className="text-gray-600">Time Limit</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{quiz.attempts}</p>
                          <p className="text-gray-600">Attempts</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button className="w-full" onClick={() => router.push(`/quiz/${quiz.id}`)}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Quizzes</CardTitle>
                <CardDescription>Your latest quiz attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentQuizzes.map((quiz, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{quiz.title}</p>
                        <p className="text-xs text-gray-500">{quiz.date}</p>
                      </div>
                      <div className="text-right">
                        {quiz.status === "completed" ? (
                          <p className={`text-sm font-semibold ${getScoreColor(quiz.score)}`}>{quiz.score}%</p>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  View All Results
                </Button>
              </CardContent>
            </Card>

            {/* Quiz Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Average</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">24</p>
                      <p className="text-xs text-gray-600">Quizzes Taken</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">18</p>
                      <p className="text-xs text-gray-600">Passed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Study Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Study</CardTitle>
                <CardDescription>Based on your performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded bg-red-50">
                    <div>
                      <p className="text-sm font-medium">Graph Algorithms</p>
                      <p className="text-xs text-gray-600">Needs improvement</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-yellow-50">
                    <div>
                      <p className="text-sm font-medium">Database Indexing</p>
                      <p className="text-xs text-gray-600">Review recommended</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-green-50">
                    <div>
                      <p className="text-sm font-medium">Basic Sorting</p>
                      <p className="text-xs text-gray-600">Well mastered</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
