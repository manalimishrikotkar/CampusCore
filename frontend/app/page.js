"use client"

import React, { useEffect, useState } from 'react';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, MessageCircle, Trophy, MapPin, Upload, Brain, Users } from "lucide-react"

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/')
      .then((res) => res.text())
      .then((data) => setMessage(data));
  }, []);

  const features = [
    {
      icon: <Upload className="h-8 w-8 text-blue-600" />,
      title: "Upload Notes",
      description:
        "Share your study materials with the community. Upload PDFs, Word docs, or text files with subject tags.",
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      title: "AI Quiz Generation",
      description: "Automatically generate MCQs and flashcards from uploaded notes using AI technology.",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-green-600" />,
      title: "Anonymous Q&A",
      description: "Ask questions anonymously and get help from the community without revealing your identity.",
    },
    {
      icon: <Trophy className="h-8 w-8 text-yellow-600" />,
      title: "Leaderboard",
      description: "Compete with peers and get recognized for your helpful contributions to the community.",
    },
    {
      icon: <MapPin className="h-8 w-8 text-red-600" />,
      title: "Campus Services",
      description: "Find nearby hostels, mess facilities, and healthcare services around your campus.",
    },
    {
      icon: <Users className="h-8 w-8 text-indigo-600" />,
      title: "Community Driven",
      description: "Join a vibrant community of students helping each other succeed academically.",
    },
  ]

  const stats = [
    { number: "10K+", label: "Notes Uploaded" },
    { number: "5K+", label: "Active Students" },
    { number: "50K+", label: "Questions Answered" },
    { number: "95%", label: "Success Rate" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">CampusCore</span>
            </div>
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
              <Link href="/leaderboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                Leaderboard
              </Link>
              <Link href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">
                Services
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              {!isLoggedIn ? (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              ) : (
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Ultimate
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              Campus Resource{" "}
            </span>
            Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload notes, generate AI-powered quizzes, ask questions anonymously, and access campus services - all in
            one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="px-8 py-3 text-lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="/notes">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg bg-transparent">
                Browse Notes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need for Academic Success</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover powerful features designed to enhance your learning experience and connect you with your campus
              community.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Study Experience?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who are already using CampusCore to excel in their academics.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
              Start Your Journey Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6" />
                <span className="text-xl font-bold">CampusCore</span>
              </div>
              <p className="text-gray-400">Empowering students with collaborative learning and campus resources.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/notes" className="hover:text-white">
                    Notes Repository
                  </Link>
                </li>
                <li>
                  <Link href="/quiz" className="hover:text-white">
                    AI Quiz Generator
                  </Link>
                </li>
                <li>
                  <Link href="/qna" className="hover:text-white">
                    Anonymous Q&A
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="hover:text-white">
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Campus</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/services" className="hover:text-white">
                    Nearby Hostels
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white">
                    Mess Facilities
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white">
                    Healthcare
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CampusCore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
