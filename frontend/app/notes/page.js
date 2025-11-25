"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Search, Download, Eye, Heart, Upload, Star, Github, Linkedin, User as UserIcon, Code2 } from "lucide-react"

export default function NotesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedNotes, setLikedNotes] = useState({});
  const router = useRouter();
  const [quizAttempts, setQuizAttempts] = useState({});
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [showCreatorProfile, setShowCreatorProfile] = useState(false);

  // existing state & hooks...

  const openCreatorProfile = (creator) => {
    if (!creator) return;
    setSelectedCreator(creator);
    setShowCreatorProfile(true);
  };

  const closeCreatorProfile = () => {
    setShowCreatorProfile(false);
    setSelectedCreator(null);
  };

  // ...rest of component (filters, handlers, etc.)


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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("quizAttempts");
    if (stored) {
      try {
        setQuizAttempts(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse quizAttempts from localStorage", e);
      }
    }
  }, []);


  const handleStartQuiz = (noteId) => {
    // markAttempted(noteId);
    router.push(`/quiz/${noteId}`);
  };

  const handleRestartQuiz = async (noteId) => {
  try {
    console.log("Restarting quiz for:", noteId);

    const res = await fetch(`http://localhost:5000/api/quiz/requiz/${noteId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to restart quiz");
    }

    // After successful backend call → redirect
    router.push(`/requiz/${noteId}`);
  } catch (error) {
    console.error("Restart quiz failed:", error);
  }
};





  // const notes = [
  // ]
  const handleLike = async (noteId) => {
    try {
      console.log("noteid", noteId);
      const res = await fetch(`http://localhost:5000/api/posts/${noteId}/like`, {
        method: "PUT",
        credentials: "include", // required if protected
      });
      console.log("res", res);
      if (!res.ok) {
        throw new Error("Like failed");
      }

      const updatedNote = await res.json(); // backend sends updated note (optional)
      console.log("updatedNote", updatedNote.likes)
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

  const handleDownload = async (postId, fileUrl, fileName) => {
    try {
      // 1️⃣ Increment download count in backend
      await fetch(`http://localhost:5000/api/posts/${postId}/download`, {
        method: "PUT",
        credentials: "include",
      });

      // 2️⃣ Force download via Cloudinary transformation
      if (fileUrl) {
        const downloadUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", fileName || "note.pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Download not available.");
      }

      // 3️⃣ (Optional) Update UI locally
      setNotes(prev =>
        prev.map(note =>
          note._id === postId ? { ...note, downloads: (note.downloads || 0) + 1 } : note
        )
      );
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handlePreview = (noteId) => {
    router.push(`/notes/${noteId}`);
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
              <Link href="/notes/upload">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Notes
                </Button>
              </Link>
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
            <Card key={note._id} className="hover:shadow-lg transition-shadow duration-300">
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
                    {note.tags.slice(0, 3).map((tag) => (
                      <Badge key={`${note._id}- ${tag}`} variant="outline" className="text-xs">
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
                      <button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleDownload(note._id, note.file?.url, note.file?.originalName)}
                      >
                        <Download className="h-4 w-4 mr-2" />

                      </button>


                      <button
                        onClick={() => handleLike(note._id)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition"
                      >
                        <Heart
                          className={`h-4 w-4 ${likedNotes[note._id] ? "fill-red-500 text-red-500" : ""}`}
                        />
                        <span>{note.likes}</span>
                      </button>

                    </div>
                  </div>


                  {/* Author and Date + Quick Profile */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>
                      <p>By {note.createdBy?.name || "Unknown"}</p>
                      <p>{new Date(note.createdAt).toLocaleDateString()}</p>
                    </div>

                    {note.createdBy && (
                      <button
                        type="button"
                        onClick={() => openCreatorProfile(note.createdBy)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View profile
                      </button>
                    )}
                  </div>


                  {/* Actions */}
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePreview(note._id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    {!quizAttempts[note._id] ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleStartQuiz(note._id)}
                      >
                        Start Quiz
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleRestartQuiz(note._id)}
                      >
                        Restart Quiz
                      </Button>
                    )}

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
      {/* Creator Quick Profile Overlay */}
      {
        showCreatorProfile && selectedCreator && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
              {/* Close button */}
              <button
                onClick={closeCreatorProfile}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>

              {/* Avatar */}
              <div className="flex flex-col items-center text-center space-y-3">
                {selectedCreator.profileImageBase64 ? (
                  <img
                    src={`data:image/png;base64,${selectedCreator.profileImageBase64}`}
                    alt={selectedCreator.name}
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">
                      {selectedCreator.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}


                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedCreator.name}
                  </h2>
                  {selectedCreator.email && (
                    <p className="text-xs text-gray-500">{selectedCreator.email}</p>
                  )}
                </div>

                {/* Social Links */}
                <div className="w-full pt-4 border-t space-y-2">
                  {selectedCreator.github && (
                    <a
                      href={selectedCreator.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                      </div>
                      <span className="text-xs text-gray-500 truncate max-w-[140px]">
                        {selectedCreator.github}
                      </span>
                    </a>
                  )}

                  {selectedCreator.leetcode && (
                    <a
                      href={selectedCreator.leetcode}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <Code2 className="h-4 w-4" />
                        <span>LeetCode</span>
                      </div>
                      <span className="text-xs text-gray-500 truncate max-w-[140px]">
                        {selectedCreator.leetcode}
                      </span>
                    </a>
                  )}

                  {selectedCreator.linkedin && (
                    <a
                      href={selectedCreator.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <Linkedin className="h-4 w-4" />
                        <span>LinkedIn</span>
                      </div>
                      <span className="text-xs text-gray-500 truncate max-w-[140px]">
                        {selectedCreator.linkedin}
                      </span>
                    </a>
                  )}

                  {!selectedCreator.github &&
                    !selectedCreator.leetcode &&
                    !selectedCreator.linkedin && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        No social profiles added.
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* <- your outermost div */}

    </div >
  )
}
