"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import NotesWithQuiz from "@/components/NotesWithQuiz";

// Build a Drive preview URL for embedding
const getPreviewUrlFromFile = (file) => {
  if (!file) return "";

  // If we have a typical Drive view link in file.url
  if (file.url && file.url.includes("/file/d/") && file.url.includes("/view")) {
    return file.url.replace("/view", "/preview");
  }

  // If we only have downloadUrl like ...uc?export=download&id=...
  if (file.downloadUrl && file.downloadUrl.includes("uc?export=download")) {
    try {
      const u = new URL(file.downloadUrl);
      const id = u.searchParams.get("id");
      if (id) {
        return `https://drive.google.com/file/d/${id}/preview`;
      }
    } catch (e) {
      console.warn("Invalid downloadUrl format", file.downloadUrl);
    }
  }

  // Fallback: use whatever we have
  return file.downloadUrl || file.url || "";
};

export default function NotesWithQuizWrapper() {
  const params = useParams();
  const noteId = params.noteId;
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!noteId) return;

    setLoading(true);
    fetch(`http://localhost:5000/api/posts/${noteId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load note");
        return res.json();
      })
      .then((data) => {
        setNote(data);
      })
      .catch((err) => {
        console.error("Error loading note:", err);
      })
      .finally(() => setLoading(false));
  }, [noteId]);

  if (loading || !note) return <p>Loading…</p>;

  const fileUrl = getPreviewUrlFromFile(note.file);

  console.log("Preview fileUrl used in NotesWithQuiz:", fileUrl);

  return (
    <NotesWithQuiz
      fileUrl={fileUrl}
      noteId={noteId}
    />
  );
}
