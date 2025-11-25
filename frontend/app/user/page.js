"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Upload, Brain, MessageCircle, Trophy, MapPin, User, Settings, Bell, TrendingUp } from "lucide-react"
import { requireAuth } from "@/utils/protectRoute"
export default function DashboardPage() {
  // const [user] = useState({
  //   name: "John Doe",
  //   email: "john.doe@example.com",
  //   semester: "5th",
  //   branch: "Computer Science",
  //   points: 1250,
  //   rank: 15,
  // })
  const [user, setUser] = useState({ name: "", points: 0, rank: 0, semester: "", branch: "" });
  const [quickStatsData, setQuickStatsData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);


  // useEffect(() => {
  //   requireAuth("student");

  //   const fetchUserData = async () => {
  //     try {
  //       // Fetch user details
  //       const resUser = await fetch("http://localhost:5000/api/user/me", {
  //         credentials: "include",
  //       });
  //       const dataUser = await resUser.json();

  //       // Fetch quick stats
  //       const resStats = await fetch("http://localhost:5000/api/user/stats", {
  //         credentials: "include",
  //       });
  //       const dataStats = await resStats.json();

  //       // Fetch recent activity
  //       const resActivity = await fetch("http://localhost:5000/api/user/recent-activity", {
  //         credentials: "include",
  //       });
  //       const dataActivity = await resActivity.json();

  //       console.log("User Data:", dataUser);
  //       console.log("Stats Data:", dataStats);
  //       console.log("Activity Data:", dataActivity);

  //       if (resUser.ok) {
  //         setUser(dataUser.user || dataUser);
  //       } else {
  //         console.error("Failed to load user:", dataUser.message);
  //       }

  //       if (resStats.ok) {
  //         setQuickStatsData(dataStats);
  //       } else {
  //         console.error("Failed to load stats:", dataStats.message);
  //       }

  //       if (resActivity.ok) {
  //         setRecentActivity(dataActivity);
  //       } else {
  //         console.error("Failed to load activity:", dataActivity.message);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch dashboard data:", error);
  //     }
  //   };

  //   fetchUserData();
  // }, []);

  useEffect(() => {
    requireAuth("student");

    const fetchUserData = async () => {
      try {
        const [resUser, resStats, resActivity, resAchievements] = await Promise.all([
          fetch("http://localhost:5000/api/user/me", { credentials: "include" }),
          fetch("http://localhost:5000/api/user/stats", { credentials: "include" }),
          fetch("http://localhost:5000/api/user/recent-activity", { credentials: "include" }),
          fetch("http://localhost:5000/api/user/achievements", { credentials: "include" }),
        ]);

        const [dataUser, dataStats, dataActivity, dataAchievements] = await Promise.all([
          resUser.json(),
          resStats.json(),
          resActivity.json(),
          resAchievements.json(),
        ]);

        if (resUser.ok) setUser(dataUser.user || dataUser);
        if (resStats.ok) setQuickStatsData(dataStats);
        if (resActivity.ok) setRecentActivity(dataActivity);
        if (resAchievements.ok) setAchievements(dataAchievements);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchUserData();
  }, []);


  const quickStats = [
    { label: "Notes Uploaded", value: quickStatsData?.notesUploaded || 0, icon: <Upload className="h-5 w-5" /> },
    { label: "Quizzes Taken", value: quickStatsData?.quizzesTaken || 0, icon: <Brain className="h-5 w-5" /> },
    { label: "Questions Asked", value: quickStatsData?.questionsAsked || 0, icon: <MessageCircle className="h-5 w-5" /> },
    { label: "Total Points", value: quickStatsData?.totalPoints || 0, icon: <Trophy className="h-5 w-5" /> },
  ];


  const getActivityIcon = (type) => {
    switch (type) {
      case "upload":
        return <Upload className="h-4 w-4 text-blue-600" />
      case "quiz":
        return <Brain className="h-4 w-4 text-purple-600" />
      case "answer":
        return <MessageCircle className="h-4 w-4 text-green-600" />
      case "question":
        return <MessageCircle className="h-4 w-4 text-orange-600" />
      default:
        return <BookOpen className="h-4 w-4" />
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
              <Link href="/roadmap" className="text-gray-600 hover:text-blue-600 transition-colors">
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
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">{user?.name || "Loading..."}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || "Student"}!
          </h1>
          <p className="text-gray-600">
            {user?.semester || "-"} Semester • {user?.branch || "-"} • Rank #{user?.rank || "-"}
          </p>
        </div>


        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                  <div className="text-blue-600">{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump into your most used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/notes/upload">
                    <Button className="w-full h-20 flex flex-col space-y-2 bg-transparent" variant="outline">
                      <Upload className="h-6 w-6" />
                      <span>Upload Notes</span>
                    </Button>
                  </Link>
                  <Link href="/notes">
                    <Button className="w-full h-20 flex flex-col space-y-2 bg-transparent" variant="outline">
                      <Brain className="h-6 w-6" />
                      <span>Take Quiz</span>
                    </Button>
                  </Link>
                  <Link href="/qna/ask">
                    <Button className="w-full h-20 flex flex-col space-y-2 bg-transparent" variant="outline">
                      <MessageCircle className="h-6 w-6" />
                      <span>Ask Question</span>
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button className="w-full h-20 flex flex-col space-y-2 bg-transparent" variant="outline">
                      <MapPin className="h-6 w-6" />
                      <span>Campus Services</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest contributions and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 border hover:bg-gray-100 transition"
                      >
                        <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                        <Badge variant="secondary">+{activity.points} pts</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-6">No recent activity yet.</div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Your Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Level Progress</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{user.points}</p>
                    <p className="text-sm text-gray-600">Total Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">#{user.rank}</p>
                    <p className="text-sm text-gray-600">Current Rank</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="space-y-3">
                    {achievements.map((a, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-${a.color}-100 rounded-full flex items-center justify-center`}>
                          {a.icon === "trophy" && <Trophy className={`h-4 w-4 text-${a.color}-600`} />}
                          {a.icon === "upload" && <Upload className={`h-4 w-4 text-${a.color}-600`} />}
                          {a.icon === "message" && <MessageCircle className={`h-4 w-4 text-${a.color}-600`} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{a.title}</p>
                          <p className="text-xs text-gray-500">{a.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">No achievements yet.</p>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}
