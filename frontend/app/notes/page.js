"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Search, Download, Eye, Heart, Upload, Star } from "lucide-react"

export default function NotesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedNotes, setLikedNotes] = useState({});



  const subjects = [
    "All Subjects",
    "Data Structures",
    "Algorithms",
    "Database Management",
    "Operating Systems",
    "Computer Networks",
    "Software Engineering",
  ]
  const semesters = ["All Semesters", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/posts", {
          
          credentials: "include", // if route is protected
        });

        const data = await res.json();
        console.log(data);


        if (res.ok) {
          setNotes(data.data); // or data.posts if response is wrapped
        } else {
          console.error("❌ Failed to fetch notes:", data.message);
        }
      } catch (err) {
        console.error("❌ Error fetching notes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);


  // const notes = [
  // ]
  const handleLike = async (noteId) => {
    try {
      console.log("noteid",noteId);
      const res = await fetch(`http://localhost:5000/api/posts/${noteId}/like`, {
        method: "PUT",
        credentials: "include", // required if protected
      });
      console.log("res",res);
      if (!res.ok) {
        throw new Error("Like failed");
      }

      const updatedNote = await res.json(); // backend sends updated note (optional)
      console.log("updatedNote",updatedNote.likes)
      // Update frontend state
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === noteId
            ? { ...note, likes: updatedNote.likes }
            : note
        )
      );

      // Optional: mark note as liked to prevent re-liking (for UI highlight)
      setLikedNotes((prev) => ({ ...prev, [noteId]: true }));
    } catch (err) {
      console.error("Like error:", err);
      alert("You might need to login to like a note.");
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSubject = selectedSubject === "all" || note.subject === selectedSubject
    const matchesSemester = selectedSemester === "all" || note.semester === selectedSemester

    return matchesSearch && matchesSubject && matchesSemester
  })

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
            <div className="flex items-center space-x-4">
              <Link href="/notes/upload">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Notes
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notes Repository</h1>
          <p className="text-gray-600">Discover and download study materials shared by your peers</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search notes, topics, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.slice(1).map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {semesters.slice(1).map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredNotes.length} of {notes.length} notes
          </p>
        </div>

        {/* Notes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">{note.subject}</Badge>
                  <Badge variant="outline">{note.semester} Sem</Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                <CardDescription className="line-clamp-2">{note.description || note.message}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{note.downloads}</span>
                      </div>

                      <button
                        onClick={() => handleLike(note._id)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition"
                      >
                        <Heart
                          className={`h-4 w-4 ${likedNotes[note._id] ? "fill-red-500 text-red-500" : ""}`}
                        />
                        <span>{note.likes}</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{note.rating}</span>
                      </div>
                    </div>

                    <span>{note.pages} pages</span>
                  </div>


                  {/* Author and Date */}
                  <div className="text-sm text-gray-600">
                    <p>By {note.author}</p>
                    <p>{new Date(note.uploadDate).toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or upload the first note for this topic.
            </p>
            <Link href="/notes/upload">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Notes
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
