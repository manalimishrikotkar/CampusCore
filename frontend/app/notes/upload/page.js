"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Upload, FileText, X, CheckCircle } from "lucide-react"

export default function UploadNotesPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    semester: "",
    tags: "",
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const router = useRouter()

  const subjects = [
    "Data Structures",
    "Algorithms",
    "Database Management",
    "Operating Systems",
    "Computer Networks",
    "Software Engineering",
    "Machine Learning",
    "Web Development",
  ]
  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ]
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload only PDF, Word, or Text files")
        return
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size should be less than 10MB")
        return
      }

      setSelectedFile(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  // const handleSubmit = async (e) => {
  //   e.preventDefault()

  //   if (!selectedFile) {
  //     alert("Please select a file to upload")
  //     return
  //   }

  //   setIsUploading(true)

  //   // Simulate file upload
  //   setTimeout(() => {
  //     setIsUploading(false)
  //     setUploadSuccess(true)

  //     // Redirect after success
  //     setTimeout(() => {
  //       router.push("/notes")
  //     }, 2000)
  //   }, 3000)
  // }
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsUploading(true);

  try {
    // const token = localStorage.getItem("token"); // token from login
    // if (!token) {
    //   alert("You must be logged in to upload notes.");
    //   return;
    // }
    console.log("Hi");
    const response = await fetch("http://localhost:5000/api/posts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // ✅ important to send cookie
  body: JSON.stringify({
    title: formData.title,
    description: formData.description,
    subject: formData.subject,
    semester: formData.semester,
    tags: formData.tags.split(",").map(tag => tag.trim()),
  }),
});

    console.log("Hi2");
    const data = await response.json();
    console.log("📤 Upload response:", data);

    if (response.ok) {
      setUploadSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } else {
      alert(data.message || "Upload failed");
    }
  } catch (error) {
    console.error("Upload error:", error);
    alert("Something went wrong.");
  } finally {
    setIsUploading(false);
  }
};


  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
            <p className="text-gray-600 mb-4">Your notes have been uploaded and are pending admin approval.</p>
            <p className="text-sm text-gray-500 mb-6">
              You'll be notified once they're approved and available to the community.
            </p>
            <Button onClick={() => router.push("/notes")} className="w-full">
              View All Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
              <Link href="/notes" className="text-blue-600 font-medium">
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
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Notes</h1>
          <p className="text-gray-600">Share your study materials with the community and help others learn</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Note Details</CardTitle>
                <CardDescription>Provide information about your notes to help others find them easily</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Data Structures Complete Guide"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe what topics are covered in your notes..."
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select onValueChange={(value) => handleSelectChange("subject", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester *</Label>
                      <Select onValueChange={(value) => handleSelectChange("semester", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map((semester) => (
                            <SelectItem key={semester} value={semester}>
                              {semester}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      name="tags"
                      placeholder="e.g., arrays, sorting, algorithms (comma separated)"
                      value={formData.tags}
                      onChange={handleChange}
                    />
                    <p className="text-sm text-gray-500">Add relevant tags to help others discover your notes</p>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Upload File *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      {!selectedFile ? (
                        <div className="text-center">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <div className="mb-4">
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <span className="text-blue-600 hover:text-blue-500 font-medium">Click to upload</span>
                              <span className="text-gray-600"> or drag and drop</span>
                            </label>
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.txt"
                              onChange={handleFileChange}
                            />
                          </div>
                          <p className="text-sm text-gray-500">PDF, Word, or Text files up to 10MB</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">{selectedFile.name}</p>
                              <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isUploading} className="flex-1">
                      {isUploading ? (
                        <>
                          <Upload className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Notes
                        </>
                      )}
                    </Button>
                    <Link href="/notes">
                      <Button type="button" variant="outline" className="flex-1 bg-transparent">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Guidelines Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">File Requirements</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• PDF, Word, or Text files only</li>
                    <li>• Maximum file size: 10MB</li>
                    <li>• Clear, readable content</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Content Guidelines</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Original or properly attributed content</li>
                    <li>• Accurate and helpful information</li>
                    <li>• Well-organized and structured</li>
                    <li>• No copyrighted material</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Approval Process</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Admin review within 24-48 hours</li>
                    <li>• Email notification upon approval</li>
                    <li>• Earn points for approved uploads</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips for Better Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Use descriptive, searchable titles</li>
                  <li>• Add relevant tags and keywords</li>
                  <li>• Include comprehensive descriptions</li>
                  <li>• Choose the correct subject and semester</li>
                  <li>• Ensure high-quality, readable content</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
