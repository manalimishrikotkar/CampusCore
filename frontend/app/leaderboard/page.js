"use client"

import { useState,useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Trophy, Medal, Award, Crown, Star, TrendingUp, Users } from "lucide-react"

export default function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("all-time")
  const [leaders, setLeaders] = useState([])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/leaderboard")
        const data = await res.json()
        setLeaders(data)
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err)
      }
    }

    fetchLeaderboard()
  }, [])

  const topContributors = [
    {
      rank: 1,
      name: "Sarah Johnson",
      points: 2850,
      notesUploaded: 45,
      questionsAnswered: 128,
      likesReceived: 892,
      badge: "Expert Contributor",
      avatar: "SJ",
      trend: "up",
    },
    {
      rank: 2,
      name: "Mike Chen",
      points: 2640,
      notesUploaded: 38,
      questionsAnswered: 156,
      likesReceived: 734,
      badge: "Knowledge Master",
      avatar: "MC",
      trend: "up",
    },
    {
      rank: 3,
      name: "Emily Davis",
      points: 2420,
      notesUploaded: 52,
      questionsAnswered: 89,
      likesReceived: 678,
      badge: "Study Guide Pro",
      avatar: "ED",
      trend: "down",
    },
    {
      rank: 4,
      name: "Alex Rodriguez",
      points: 2180,
      notesUploaded: 29,
      questionsAnswered: 142,
      likesReceived: 567,
      badge: "Helper Hero",
      avatar: "AR",
      trend: "up",
    },
    {
      rank: 5,
      name: "Lisa Wang",
      points: 1950,
      notesUploaded: 41,
      questionsAnswered: 98,
      likesReceived: 523,
      badge: "Rising Star",
      avatar: "LW",
      trend: "up",
    },
    {
      rank: 6,
      name: "David Kim",
      points: 1820,
      notesUploaded: 33,
      questionsAnswered: 87,
      likesReceived: 456,
      badge: "Consistent Contributor",
      avatar: "DK",
      trend: "same",
    },
    {
      rank: 7,
      name: "Rachel Green",
      points: 1680,
      notesUploaded: 28,
      questionsAnswered: 76,
      likesReceived: 398,
      badge: "Quality Creator",
      avatar: "RG",
      trend: "up",
    },
    {
      rank: 8,
      name: "James Wilson",
      points: 1540,
      notesUploaded: 25,
      questionsAnswered: 92,
      likesReceived: 367,
      badge: "Problem Solver",
      avatar: "JW",
      trend: "down",
    },
    {
      rank: 9,
      name: "Anna Martinez",
      points: 1420,
      notesUploaded: 31,
      questionsAnswered: 64,
      likesReceived: 334,
      badge: "Study Buddy",
      avatar: "AM",
      trend: "up",
    },
    {
      rank: 10,
      name: "Tom Anderson",
      points: 1290,
      notesUploaded: 22,
      questionsAnswered: 58,
      likesReceived: 298,
      badge: "Newcomer",
      avatar: "TA",
      trend: "up",
    },
  ]

  const weeklyLeaders = [
    { rank: 1, name: "Mike Chen", points: 340, change: "+2" },
    { rank: 2, name: "Sarah Johnson", points: 285, change: "-1" },
    { rank: 3, name: "Lisa Wang", points: 267, change: "+5" },
    { rank: 4, name: "Alex Rodriguez", points: 234, change: "+1" },
    { rank: 5, name: "Emily Davis", points: 198, change: "-3" },
  ]

  const achievements = [
    {
      title: "First Upload",
      description: "Upload your first set of notes",
      icon: <BookOpen className="h-6 w-6" />,
      rarity: "Common",
      holders: 1250,
    },
    {
      title: "Quiz Master",
      description: "Complete 50 quizzes with 80%+ score",
      icon: <Trophy className="h-6 w-6" />,
      rarity: "Rare",
      holders: 89,
    },
    {
      title: "Helper Hero",
      description: "Answer 100 questions in Q&A",
      icon: <Medal className="h-6 w-6" />,
      rarity: "Epic",
      holders: 34,
    },
    {
      title: "Knowledge King",
      description: "Reach 5000 total points",
      icon: <Crown className="h-6 w-6" />,
      rarity: "Legendary",
      holders: 12,
    },
  ]

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default:
        return <div className="w-4 h-4" />
    }
  }

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-100 text-gray-800"
      case "Rare":
        return "bg-blue-100 text-blue-800"
      case "Epic":
        return "bg-purple-100 text-purple-800"
      case "Legendary":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
              <Link href="/quiz" className="text-gray-600 hover:text-blue-600 transition-colors">
                Quiz
              </Link>
              <Link href="/qna" className="text-gray-600 hover:text-blue-600 transition-colors">
                Q&A
              </Link>
              <Link href="/leaderboard" className="text-blue-600 font-medium">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">Recognize top contributors and track your progress in the community</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Leaderboard */}
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="all-time" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all-time">All Time</TabsTrigger>
                <TabsTrigger value="monthly">This Month</TabsTrigger>
                <TabsTrigger value="weekly">This Week</TabsTrigger>
              </TabsList>

              <TabsContent value="all-time">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span>Top Contributors - All Time</span>
                    </CardTitle>
                    <CardDescription>
                      Users with the highest contribution scores based on notes uploaded, questions answered, and
                      community engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Top 3 Podium */}
                    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-purple-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-800">
              🏆 Leaderboard
            </CardTitle>
            <Crown className="h-8 w-8 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {leaders.map((user, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-white border p-4 rounded-md shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-semibold text-gray-700">
                      #{index + 1}
                    </span>
                    <span className="text-lg text-gray-900">{user.name}</span>
                  </div>
                  <div className="text-purple-700 font-semibold text-lg">
                    {user.topLikes} Likes
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
                    {/* <div className="grid md:grid-cols-3 gap-4 mb-8">
                      {topContributors.slice(0, 3).map((user, index) => (
                        <Card key={user.rank} className={`text-center ${index === 0 ? "ring-2 ring-yellow-400" : ""}`}>
                          <CardContent className="p-6">
                            <div className="mb-4">{getRankIcon(user.rank)}</div>
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                              {user.avatar}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{user.name}</h3>
                            <p className="text-2xl font-bold text-blue-600 mb-2">{user.points.toLocaleString()}</p>
                            <Badge className={getRarityColor("Epic")}>{user.badge}</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div> */}

                    {/* Rest of the leaderboard */}
                    {/* <div className="space-y-2">
                      {topContributors.slice(3).map((user) => (
                        <div
                          key={user.rank}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {getRankIcon(user.rank)}
                              {getTrendIcon(user.trend)}
                            </div>
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.avatar}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{user.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {user.badge}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">{user.points.toLocaleString()}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{user.notesUploaded} notes</span>
                              <span>{user.questionsAnswered} answers</span>
                              <span>{user.likesReceived} likes</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div> */}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monthly">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Contributors - This Month</CardTitle>
                    <CardDescription>Leading contributors for the current month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {weeklyLeaders.map((user) => (
                        <div
                          key={user.rank}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-bold text-gray-600">#{user.rank}</span>
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <span className="font-semibold text-gray-900">{user.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">{user.points}</p>
                            <p className="text-sm text-gray-500">{user.change} from last month</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="weekly">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Contributors - This Week</CardTitle>
                    <CardDescription>Most active contributors this week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {weeklyLeaders.map((user) => (
                        <div
                          key={user.rank}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-bold text-gray-600">#{user.rank}</span>
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <span className="font-semibold text-gray-900">{user.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">{user.points}</p>
                            <p className="text-sm text-gray-500">{user.change} from last week</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Rank */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Your Rank</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">#15</div>
                  <p className="text-gray-600 mb-4">Current Position</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Points:</span>
                      <span className="font-semibold">1,250</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notes:</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Answers:</span>
                      <span className="font-semibold">28</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Likes:</span>
                      <span className="font-semibold">89</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Unlock badges by contributing to the community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                      <div className="text-blue-600">{achievement.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getRarityColor(achievement.rarity)} variant="outline">
                            {achievement.rarity}
                          </Badge>
                          <span className="text-xs text-gray-500">{achievement.holders} holders</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Community Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">5,247</p>
                    <p className="text-sm text-gray-600">Active Members</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold">1,892</p>
                      <p className="text-xs text-gray-600">Notes Shared</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">8,456</p>
                      <p className="text-xs text-gray-600">Questions Answered</p>
                    </div>
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
