"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, CheckCircle, XCircle, RotateCcw, Home, Trophy, AlertCircle } from "lucide-react"
// import { apiClient } from "@/lib/api"

export default function QuizPage() {
    const router = useRouter()
    const params = useParams()
    const postId = params.id

    // Quiz states
    const [quiz, setQuiz] = useState(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState({})
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [quizStarted, setQuizStarted] = useState(false)
    const [quizCompleted, setQuizCompleted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [results, setResults] = useState(null)

    // Timer effect
    useEffect(() => {
        let interval = null
        if (quizStarted && !quizCompleted && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((time) => {
                    if (time <= 1) {
                        handleSubmitQuiz()
                        return 0
                    }
                    return time - 1
                })
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [quizStarted, quizCompleted, timeRemaining])


    // Fetch quiz data
    useEffect(() => {
        fetchQuizData()
    }, [postId])

    // const fetchQuizData = async () => {
    //   try {
    //     setLoading(true)
    //     // Replace with your actual API endpoint
    //     const response = await fetch(`/quiz/${postId}`)

    //     if (response.success) {
    //       setQuiz(response.data)
    //       // Set timer (assuming 2 minutes per question or use quiz.timeLimit)
    //       const totalTime = response.data.questions.length * 120 // 2 minutes per question
    //       setTimeRemaining(totalTime)
    //     } else {
    //       throw new Error("Failed to fetch quiz")
    //     }
    //   } catch (error) {
    //     console.error("Error fetching quiz:", error)
    //   //returned json comes here
    //   setQuiz()
    //     setTimeRemaining(600) // 10 minutes for demo
    //   } finally {
    //     setLoading(false)
    //   }
    // }

    const fetchQuizData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/quiz/requiz/${postId}`, {
                credentials: "include",
            });
          
           
            console.log("waiting for the response");

            const data = await response.json();
            console.log("requizdata😒", data);

            if (response.ok && data.success) {
                const ai = data.data;   // <-- this contains mode, questions, roadmap

                setQuiz(ai);  // store the entire AI object

                const totalTime = ai.questions?.length ? ai.questions.length * 120 : 600;
                setTimeRemaining(totalTime);
            }
            else {
                throw new Error("Failed to fetch quiz");
            }
        } catch (error) {
            console.error("Error fetching quiz:", error);
            setQuiz(null);
            setTimeRemaining(600); // fallback
        } finally {
            setLoading(false);
        }
    };


    const startQuiz = () => { //Logic adds here for restart quiz 
        setQuizStarted(true)
    }

    const handleAnswerSelect = (questionId, selectedOption) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: selectedOption,
        }))
    }

    const goToNextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1)
        }
    }

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1)
        }
    }

    const goToQuestion = (index) => {
        setCurrentQuestionIndex(index)
    }


    const handleSubmitQuiz = async () => {
        setSubmitting(true);

        try {
            let correctAnswers = 0;
            const questionResults = quiz.questions.map((question) => {
                const userAnswer = selectedAnswers[question._id];
                const isCorrect = userAnswer === question.answer;
                if (isCorrect) correctAnswers++;
                return {
                    questionId: question._id,
                    question: question.question,
                    userAnswer,
                    correctAnswer: question.answer,
                    isCorrect,
                };
            });

            const score = Math.round((correctAnswers / quiz.questions.length) * 100);
            const timeTaken = quiz.questions.length * 120 - timeRemaining;

            const quizResults = {
                score,
                correctAnswers,
                totalQuestions: quiz.questions.length,
                timeTaken,
                questionResults,
                passed: score >= 60,
            };

            console.log("Submitting quiz with postId:", postId);


            // ✅ Submit to backend
            const response = await fetch(`http://localhost:5000/api/quiz/${postId}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    answers: selectedAnswers,
                    timeTaken,
                    score,
                }),
            });

            const resultData = await response.json();
            console.log("📤 Quiz submission result:", resultData);

            if (typeof window !== "undefined") {
                const stored = localStorage.getItem("quizAttempts");
                let map = {};
                if (stored) {
                    try {
                        map = JSON.parse(stored);
                    } catch (e) {
                        console.error("Failed to parse quizAttempts in quiz page", e);
                    }
                }
                // postId here is the same as noteId/postId
                map[postId] = {
                    completed: true,
                    lastScore: score,        // extra info if you want to use later
                };
                localStorage.setItem("quizAttempts", JSON.stringify(map));
            }

            setResults(quizResults);
            setQuizCompleted(true);
        } catch (error) {
            console.error("Error submitting quiz:", error);
        } finally {
            setSubmitting(false);
        }
    };


    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
    }

    const getScoreColor = (score) => {
        if (score >= 80) return "text-green-600"
        if (score >= 60) return "text-yellow-600"
        return "text-red-600"
    }

    const getScoreBadgeColor = (score) => {
        if (score >= 80) return "bg-green-100 text-green-800"
        if (score >= 60) return "bg-yellow-100 text-yellow-800"
        return "bg-red-100 text-red-800"
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading quiz...</p>
                </div>
            </div>
        )
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
                        <p className="text-gray-600 mb-6">The quiz you're looking for doesn't exist or has been removed.</p>
                        <Link href="/notes">
                            <Button>Back to Quizzes</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Quiz Results Screen
    if (quizCompleted && results) {
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
                                <Link href="/notes">
                                    <Button variant="outline">More Quizzes</Button>
                                </Link>
                                <Link href="/user">
                                    <Button variant="outline">Dashboard</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Results Header */}
                    <div className="text-center mb-8">
                        <div className="mb-4">
                            {results.passed ? (
                                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                            ) : (
                                <XCircle className="h-16 w-16 text-red-600 mx-auto" />
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {results.passed ? "Congratulations!" : "Quiz Completed"}
                        </h1>
                        <p className="text-gray-600">You've completed the {quiz.subject} quiz</p>
                    </div>

                    {/* Score Summary */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                <span>Your Results</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-4 gap-6 text-center">
                                <div>
                                    <p className={`text-3xl font-bold ${getScoreColor(results.score)}`}>{results.score}%</p>
                                    <p className="text-sm text-gray-600">Final Score</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {results.correctAnswers}/{results.totalQuestions}
                                    </p>
                                    <p className="text-sm text-gray-600">Correct Answers</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-purple-600">{formatTime(results.timeTaken)}</p>
                                    <p className="text-sm text-gray-600">Time Taken</p>
                                </div>
                                <div>
                                    <Badge className={getScoreBadgeColor(results.score)}>{results.passed ? "PASSED" : "FAILED"}</Badge>
                                    <p className="text-sm text-gray-600 mt-1">Status</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Question Review */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Question Review</CardTitle>
                            <CardDescription>Review your answers and see the correct solutions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {results.questionResults.map((result, index) => (
                                    <div key={result.questionId} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                                            {result.isCorrect ? (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-600" />
                                            )}
                                        </div>

                                        <p className="text-gray-700 mb-4">{result.question}</p>

                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-600">Your Answer:</span>
                                                <Badge variant={result.isCorrect ? "default" : "destructive"}>
                                                    {result.userAnswer || "Not Answered"}
                                                </Badge>
                                            </div>
                                            {!result.isCorrect && (
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-gray-600">Correct Answer:</span>
                                                    <Badge variant="outline" className="border-green-600 text-green-600">
                                                        {result.correctAnswer}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {/* <Button onClick={() => window.location.reload()}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button> */}
                        <Link href="/notes">
                            <Button variant="outline">
                                <BookOpen className="h-4 w-4 mr-2" />
                                More Quizzes
                            </Button>
                        </Link>
                        <Link href="/user">
                            <Button variant="outline">
                                <Home className="h-4 w-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Quiz Start Screen
    if (!quizStarted) {
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
                            <Link href="/notes">
                                <Button variant="outline">Back to Quizzes</Button>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">{quiz.subject} Quiz</CardTitle>
                            <CardDescription>Test your knowledge with this comprehensive quiz</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Quiz Info */}
                            <div className="grid md:grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{quiz.questions.length}</p>
                                    <p className="text-sm text-gray-600">Questions</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">{formatTime(timeRemaining)}</p>
                                    <p className="text-sm text-gray-600">Time Limit</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">60%</p>
                                    <p className="text-sm text-gray-600">Pass Mark</p>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="font-medium text-yellow-800 mb-2">Instructions:</h4>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>• Read each question carefully before selecting an answer</li>
                                    <li>• You can navigate between questions using the navigation buttons</li>
                                    <li>• Your progress is automatically saved</li>
                                    <li>• The quiz will auto-submit when time runs out</li>
                                    <li>• You need 60% or higher to pass</li>
                                </ul>
                            </div>

                            {/* Start Button.. generated restart quiz triggers here */}
                            <div className="text-center">
                                <Button size="lg" onClick={startQuiz} className="px-8">
                                    Start Quiz
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // Quiz Taking Screen
    const currentQuestion = quiz.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100
    const answeredQuestions = Object.keys(selectedAnswers).length

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
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span className={timeRemaining < 300 ? "text-red-600 font-semibold" : ""}>
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                            <Badge variant="outline">{quiz.subject}</Badge>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Main Quiz Area */}
                    <div className="lg:col-span-3">
                        {/* Progress */}
                        <Card className="mb-6">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">
                                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                                    </span>
                                    <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </CardContent>
                        </Card>

                        {/* Question */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {currentQuestion.options.map((option, index) => {
                                        const optionLetter = String.fromCharCode(65 + index) // 65 = 'A'
                                        const isSelected = selectedAnswers[currentQuestion._id] === optionLetter

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleAnswerSelect(currentQuestion._id, optionLetter)}
                                                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${isSelected
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300"
                                                            }`}
                                                    >
                                                        {optionLetter}
                                                    </div>
                                                    <span className="text-gray-900">{option}</span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>


                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                            <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
                                Previous
                            </Button>

                            <div className="flex items-center space-x-4">
                                {currentQuestionIndex === quiz.questions.length - 1 ? (
                                    <Button onClick={handleSubmitQuiz} disabled={submitting} className="px-8">
                                        {submitting ? "Submitting..." : "Submit Quiz"}
                                    </Button>
                                ) : (
                                    <Button onClick={goToNextQuestion} disabled={currentQuestionIndex === quiz.questions.length - 1}>
                                        Next
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quiz Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quiz Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span>Answered:</span>
                                        <span className="font-semibold">
                                            {answeredQuestions}/{quiz.questions.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Time Left:</span>
                                        <span className={`font-semibold ${timeRemaining < 300 ? "text-red-600" : ""}`}>
                                            {formatTime(timeRemaining)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Current:</span>
                                        <span className="font-semibold">Q{currentQuestionIndex + 1}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Question Navigator */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Questions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-5 gap-2">
                                    {quiz.questions.map((question, index) => {
                                        const isAnswered = selectedAnswers[question._id]
                                        const isCurrent = index === currentQuestionIndex

                                        return (
                                            <button
                                                key={question._id}
                                                onClick={() => goToQuestion(index)}
                                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${isCurrent
                                                    ? "bg-blue-600 text-white"
                                                    : isAnswered
                                                        ? "bg-green-100 text-green-800 border border-green-300"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    }`}
                                            >
                                                {index + 1}
                                            </button>
                                        )
                                    })}
                                </div>
                                <div className="mt-4 space-y-2 text-xs">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-blue-600 rounded"></div>
                                        <span>Current</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                                        <span>Answered</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-gray-100 rounded"></div>
                                        <span>Not Answered</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmitQuiz}
                            disabled={submitting}
                            className="w-full bg-transparent"
                            variant="outline"
                        >
                            {submitting ? "Submitting..." : "Submit Quiz"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
