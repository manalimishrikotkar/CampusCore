"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MIN_DWELL_MS = 15000; // 15 seconds per segment

const NotesWithQuiz = ({ fileUrl, noteId }) => {
  const [ocrSegments, setOcrSegments] = useState([]);
  const [currentSegment, setCurrentSegment] = useState(-1);
  const [completedSegments, setCompletedSegments] = useState([]); // [bool]
  const [passedSegments, setPassedSegments] = useState([]);       // [bool]
  const [questionCorrect, setQuestionCorrect] = useState([]); // one bool per question


  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [activeSegmentForQuiz, setActiveSegmentForQuiz] = useState(null);

  const [pdfError, setPdfError] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const dwellTimerRef = useRef(null);

  // 🔹 Fetch OCR segments (text per page/segment) from backend
  useEffect(() => {
    if (!noteId) return;

    fetch(`http://localhost:5000/api/posts/ocr/${noteId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("OCR route returned non-200 response");
        return res.json();
      })
      .then((data) => {
        const segs = data.segments || [];
        setOcrSegments(segs);
        setCompletedSegments(new Array(segs.length).fill(false));
        setPassedSegments(new Array(segs.length).fill(false));
      })
      .catch((err) => {
        console.error("Error loading OCR data", err);
        setPdfError("Failed to load OCR segments");
      });
  }, [noteId]);

  // 🔹 Auto-start dwell timer for segment 0 on initial load
useEffect(() => {
  if (ocrSegments.length === 0) return;

  // If timer already running or segment already passed → do nothing
  if (passedSegments[0] || dwellTimerRef.current) return;

  console.log("Auto starting timer for segment 0");

  setCurrentSegment(0);

  dwellTimerRef.current = setTimeout(() => {
    setCompletedSegments((prev) => {
      const copy = [...prev];
      copy[0] = true; // mark segment 0 completed
      return copy;
    });

    setActiveSegmentForQuiz(0);
    setShowQuiz(true);
    generateQuiz(ocrSegments[0].text || "");
  }, MIN_DWELL_MS);
}, [ocrSegments, passedSegments]);


  // 🔹 Cleanup dwell timer on unmount
  useEffect(() => {
    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, []);

  // 🔹 Scroll handler – maps scroll position → segment index
  const handleScroll = (e) => {
    if (!ocrSegments.length) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const maxScrollable = scrollHeight - clientHeight || 1;
    const progress = scrollTop / maxScrollable; // 0..1

    const segmentIndex = Math.floor(progress * ocrSegments.length);
    console.log("page no.",segmentIndex);

    if (
      segmentIndex !== currentSegment &&
      segmentIndex >= 0 &&
      segmentIndex < ocrSegments.length
    ) {
      setCurrentSegment(segmentIndex);

      // Clear previous dwell timer
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
      }

      // If this segment already passed, no need to dwell or quiz again
      if (passedSegments[segmentIndex]) return;

      // Start new dwell timer for this segment
      dwellTimerRef.current = setTimeout(() => {
        // Mark as completed after dwell time
        setCompletedSegments((prev) => {
          const copy = [...prev];
          copy[segmentIndex] = true;
          return copy;
        });

        // Trigger quiz for this segment
        const segment = ocrSegments[segmentIndex];
        setActiveSegmentForQuiz(segmentIndex);
        setShowQuiz(true);
        generateQuiz(segment.text || "");
      }, MIN_DWELL_MS);
    }
  };

  // 🔹 Call backend quiz generator for this segment
  const generateQuiz = async (segmentText) => {
    try {
      setQuizLoading(true);
      const res = await fetch("http://localhost:5000/api/posts/generateQuiz", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ segmentText }),
      });

      if (!res.ok) {
        throw new Error("Quiz generation API error");
      }

      const data = await res.json();
      setQuizData(data);
      setQuestionCorrect(new Array(data.questions.length).fill(false));
    } catch (e) {
      console.error("Error generating quiz", e);
      setQuizData(null);
    } finally {
      setQuizLoading(false);
    }
  };

  // 🔹 Handle option click: mark segment as passed only if correct
  const handleOptionClick = (segmentIdx, questionIdx, option) => {
  if (!quizData?.questions || !quizData.questions[questionIdx]) return;

  const correctAnswer = quizData.questions[questionIdx].answer;
  // If options are like "A", "B", "C"... you can just do:
  const isCorrect = option === correctAnswer;
  // If options are "A. something", "B. something", you can use option[0]:
  // const isCorrect = option[0] === correctAnswer;

  console.log("option", option);
  console.log("correct", correctAnswer);

  if (!isCorrect) {
    alert("Incorrect, try again!");
    return;
  }

  // ✅ mark THIS question as correct
  setQuestionCorrect((prev) => {
    const copy = [...prev];
    copy[questionIdx] = true;

    // After marking, check if ALL are correct
    const allCorrectNow = copy.every(Boolean);

    if (allCorrectNow) {
      // mark segment as passed
      setPassedSegments((prevSegs) => {
        const segCopy = [...prevSegs];
        segCopy[segmentIdx] = true;
        return segCopy;
      });

      setShowQuiz(false); // ✅ only close when all questions are correct
    }

    return copy;
  });
};

  // 🔹 Final quiz gating logic
  const allSegmentsCompleted =
    ocrSegments.length > 0 &&
    ocrSegments.every((_, i) => completedSegments[i]);

  const allQuizzesPassed =
    ocrSegments.length > 0 &&
    ocrSegments.every((_, i) => passedSegments[i]);

  const canTakeFinalQuiz = allSegmentsCompleted && allQuizzesPassed;

  return (
    <div className="flex flex-col w-full h-screen">
      {/* 📄 Scrollable PDF container */}
      <div
        className="flex-1 w-full border rounded-lg overflow-y-auto bg-zinc-950"
        style={{ padding: "1rem" }}
        onScroll={handleScroll}
      >
        {pdfError && (
          <p className="text-red-500 text-sm mb-2">{pdfError}</p>
        )}

        {!fileUrl && <p>No file URL provided.</p>}

        {fileUrl && (
          <embed
            src={fileUrl}
            type="application/pdf"
            width="100%"
            height="1200px"
          />
        )}
      </div>

      {/* 📊 Progress + Final Quiz Button */}
      <div className="p-4 border-t flex items-center justify-between gap-4 bg-zinc-900">
        <div className="text-sm text-zinc-200">
          <p>
            Segments completed:{" "}
            <span className="font-semibold">
              {completedSegments.filter(Boolean).length} / {ocrSegments.length}
            </span>
          </p>
          <p>
            Quizzes passed:{" "}
            <span className="font-semibold">
              {passedSegments.filter(Boolean).length} / {ocrSegments.length}
            </span>
          </p>
        </div>

        <Button
          disabled={!canTakeFinalQuiz}
          variant={canTakeFinalQuiz ? "default" : "outline"}
        >
          Take Final Quiz
        </Button>
      </div>

      {/* 🧩 Segment Quiz Modal */}
      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Quiz</DialogTitle>
          </DialogHeader>

          {quizLoading && <p>Generating quiz...</p>}

          {!quizLoading && !quizData && (
            <p className="text-sm text-zinc-400">
              Failed to generate quiz. Try scrolling a bit again.
            </p>
          )}

          {!quizLoading && quizData?.questions?.length > 0 && (
            <div>
              {quizData.questions.map((q, idx) => (
                <div key={idx} className="mb-4">
                  <p className="font-semibold mb-1">{q.question}</p>

                  {q.options?.map((opt, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant="outline"
                      className="m-1"
                      onClick={() =>
                        handleOptionClick(activeSegmentForQuiz, idx, opt)
                      }
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesWithQuiz;
