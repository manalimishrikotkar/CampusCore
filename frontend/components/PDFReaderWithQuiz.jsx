// components/PDFReaderWithQuiz.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import Modal from "react-modal";

// set worker
pdfjs.GlobalWorkerOptions.workerSrc = //cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js;

Modal.setAppElement("#__next");

export default function PDFReaderWithQuiz({ driveFileUrl, postId, userId }) {
  const containerRef = useRef();
  const [numPages, setNumPages] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pageRendered, setPageRendered] = useState(1);
  const [segments, setSegments] = useState([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [quiz, setQuiz] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // compute direct download link from drive share URL
  useEffect(() => {
    // Accept either share link or direct
    const match = driveFileUrl?.match(/\/d\/([^/]+)\//);
    if (match) {
      const fileId = match[1];
      setPdfUrl(`https://drive.google.com/uc?export=download&id=${fileId}`);
    } else {
      setPdfUrl(driveFileUrl);
    }
  }, [driveFileUrl]);

  useEffect(() => {
    // fetch segments from backend
    if (!postId) return;
    fetch(`/api/notes/${postId}/segments`)
      .then((r) => r.json())
      .then((data) => setSegments(data.segments || []))
      .catch((e) => console.error("Failed to fetch segments", e));
  }, [postId]);

  // scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      // determine which page is mostly visible using bounding boxes
      // We track center of viewport and find page whose bounding box contains it.
      const viewportCenter = container.scrollTop + container.clientHeight / 2;

      // Each page has progressive offset stored in pageElements (we capture onRenderSuccess)
      const pageEls = container.querySelectorAll(".react-pdf__Page");
      let visiblePage = 1;
      for (let i = 0; i < pageEls.length; i++) {
        const el = pageEls[i];
        const rectTop = el.offsetTop;
        const rectBottom = rectTop + el.clientHeight;
        if (viewportCenter >= rectTop && viewportCenter <= rectBottom) {
          visiblePage = i + 1;
          break;
        }
      }

      setPageRendered(visiblePage);
    };

    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [numPages]);

  // when pageRendered changes, check if that page crosses segment boundary
  useEffect(() => {
    if (!segments?.length) return;

    // find which segment contains this page
    const segIndex = segments.findIndex(s => pageRendered >= s.pageStart && pageRendered <= s.pageEnd);

    if (segIndex !== -1 && segIndex !== currentSegmentIndex) {
      // show quiz for this segment
      setCurrentSegmentIndex(segIndex);
      triggerQuiz(segIndex);
    }
  }, [pageRendered, segments]);

  async function triggerQuiz(segmentIndex) {
    try {
      setLoadingQuiz(true);
      const seg = segments[segmentIndex];
      const res = await fetch("/api/quiz/segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: seg.text, questionCount: 3 })
      });
      const json = await res.json();
      setQuiz(json.questions || json);
      setModalOpen(true);
      setLoadingQuiz(false);

      // Save progress (best-effort, no auth here)
      if (userId) {
        await fetch("/api/progress/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, postId, lastSegment: segmentIndex, completedSegment: segmentIndex })
        });
      }
    } catch (err) {
      console.error("Quiz trigger error", err);
      setLoadingQuiz(false);
    }
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div
        ref={containerRef}
        style={{ overflow: "auto", height: "calc(100vh - 80px)", padding: 16 }}
      >
        {pdfUrl ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<p>Loading PDF…</p>}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={800} // adjust to container width responsively as needed
                renderAnnotationLayer={false}
                renderTextLayer={true}
              />
            ))}
          </Document>
        ) : (
          <p>No PDF URL</p>
        )}
      </div>

      <div className="p-4 flex items-center justify-between">
        <div>Page: {pageRendered} / {numPages || "?"}</div>
        <div>
          {loadingQuiz ? <span>Preparing quiz…</span> : null}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Quick Quiz"
        style={{
          content: { top: "10%", left: "10%", right: "10%", bottom: "10%" }
        }}
      >
        <div>
          <h2>Quick Read Check</h2>
          {!quiz ? (
            <p>Loading questions…</p>
          ) : (
            quiz.map((q, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <p style={{ fontWeight: 600 }}>{idx+1}. {q.question}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {q.options?.map((opt, i) => (
                    <button
                      key={i}
                      style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: 6 }}
                      onClick={() => {
                        // UX-only: show correct/wrong briefly
                        const correct = q.answer === opt || q.answer === String.fromCharCode(65+i);
                        alert(correct ? "✅ Correct" : "❌ Incorrect");
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}

          <div style={{ marginTop: 16 }}>
            <button onClick={() => setModalOpen(false)} style={{ padding: "8px 12px" }}>
              Continue reading
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}