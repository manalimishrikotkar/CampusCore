const { generateQuizFromPosts } = require('../services/quizService');
const Quiz = require('../models/Quiz')
const QuizResult = require('../models/Quizresult')
const TagScore = require("../models/TagScore");
const axios = require("axios");
const { ObjectId } = require("mongodb");

// const Post = require('../models/Post');

// exports.generateQuiz = async (req, res) => {
//   const { subject } = req.body;
//   console.log("req123",req);
//   try {
//     const quiz = await generateQuizFromPosts(subject, req.user.id);
//     res.status(201).json({ success: true, data: quiz });
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// };

// exports.getQuizById = async (req, res) => {
//   try {
//     const quiz = await Quiz.findById(req.params.id);
//     if (!quiz) {
//       return res.status(404).json({ success: false, message: "Quiz not found" });
//     }
//     res.json({ success: true, data: quiz });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// }

// exports.submitQuiz = async (req, res) => {
//   try {
//     const { quizId } = req.params;
//     const { answers, timeTaken, score } = req.body;

//     // Optional: store results to DB if needed
//     console.log("Quiz submitted:", { quizId, answers, timeTaken, score });

//     res.status(200).json({
//       success: true,
//       message: "Quiz submitted successfully",
//     });
//   } catch (err) {
//     console.error("Quiz submission error:", err);
//     res.status(500).json({ success: false, message: "Failed to submit quiz" });
//   }
// };




// exports.submitQuiz = async (req, res) => {
//   try {
//     const { postId } = req.params;                // from URL /api/quiz/:postId/submit
//     const { answers, timeTaken, score } = req.body;
//     const userId = req.user._id;                  // from protect (rbac) middleware

//     // 1) Find quiz for this post
//     const quiz = await Quiz.findOne({ postId });
//     if (!quiz) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No quiz found for this note" });
//     }

//     // 2) Compute question-level results
//     let correctAnswers = 0;
//     const questionResults = quiz.questions.map((q) => {
//       const userAnswer = answers?.[q._id];       // answers is a map: { [questionId]: 'A' | 'B' ... }
//       const isCorrect = userAnswer === q.answer;
//       if (isCorrect) correctAnswers++;

//       return {
//         questionId: q._id,
//         question: q.question,
//         userAnswer: userAnswer || null,
//         correctAnswer: q.answer,
//         isCorrect,
//       };
//     });

//     const totalQuestions = quiz.questions.length;
//     // Trust frontend score or recompute on backend:
//     const finalScore =
//       typeof score === "number"
//         ? score
//         : Math.round((correctAnswers / totalQuestions) * 100);

//     const passed = finalScore >= 60;

//     // 3) Save result to DB
//     const savedResult = await QuizResult.create({
//       user: userId,
//       post: postId,
//       score: finalScore,
//       totalQuestions,
//       correctAnswers,
//       timeTaken,
//       passed,
//       questionResults,
//     });

//     console.log("✅ Quiz result saved:", savedResult._id);

//     res.status(201).json({
//       success: true,
//       message: "Quiz submitted and result saved",
//       resultId: savedResult._id,
//       result: savedResult,
//     });
//   } catch (err) {
//     console.error("❌ Quiz submission error:", err);
//     res.status(500).json({ success: false, message: "Failed to submit quiz" });
//   }
// };




const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const API_KEY = process.env.GOOGLE_API_KEY_QUIZ;

exports.submitQuiz = async (req, res) => {
  try {

    console.log("submitQuiz params:", req.params);
    const { postId } = req.params;
    const { answers, timeTaken } = req.body;

    const quiz = await Quiz.findOne({ postId: new ObjectId(postId) });
    console.log("quiz", quiz);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    const userId = req.user.id;
    let correctCount = 0;
    const questionResults = [];

    const tagBucket = {};

    quiz.questions.forEach((q) => {
      const userAnswer = answers[q._id] || null;
      const isCorrect = userAnswer === q.answer;

      if (isCorrect) correctCount++;

      questionResults.push({
        questionId: q._id,
        question: q.question,
        userAnswer,
        correctAnswer: q.answer,
        isCorrect,
        difficulty: q.difficulty || "medium",
        tag: q.tag || "general",
      });

      const tag = q.tag || "general";

      if (!tagBucket[tag]) {
        tagBucket[tag] = { correct: 0, total: 0 };
      }

      tagBucket[tag].total++;
      if (isCorrect) tagBucket[tag].correct++;
    });

    const total = quiz.questions.length;
    const score = Math.round((correctCount / total) * 100);

    const savedQuizResult = await QuizResult.create({
      user: userId,
      post: quiz.postId,
      score,
      totalQuestions: total,
      correctAnswers: correctCount,
      timeTaken,
      passed: score >= 40,
      questionResults,
    });

    const tagScoresArray = Object.keys(tagBucket).map((tag) => {
      const { correct, total } = tagBucket[tag];
      const computedScore = Math.round((correct / total) * 100);

      return {
        tag,
        score: computedScore,
        totalQuestions: total,
        correct,
      };
    });

    const savedTagScores = await TagScore.create({
      user: userId,
      quizId: quiz._id,
      post: quiz.postId,
      tagScores: tagScoresArray,
    });

    // --------------------------------------------------------
    // INLINE ANALYSIS (YOUR ORIGINAL LOGIC)
    // --------------------------------------------------------

    const weakAreas = tagScoresArray.filter((t) => t.score < 60);
    const strongAreas = tagScoresArray.filter((t) => t.score >= 80);

    const difficultyStats = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };

    questionResults.forEach((q) => {
      const diff = q.difficulty || "medium";
      difficultyStats[diff].total++;
      if (q.isCorrect) difficultyStats[diff].correct++;
    });

    const difficultyPerformance = {
      easy: difficultyStats.easy.total
        ? Math.round(
          (difficultyStats.easy.correct / difficultyStats.easy.total) * 100
        )
        : 0,

      medium: difficultyStats.medium.total
        ? Math.round(
          (difficultyStats.medium.correct / difficultyStats.medium.total) *
          100
        )
        : 0,

      hard: difficultyStats.hard.total
        ? Math.round(
          (difficultyStats.hard.correct / difficultyStats.hard.total) * 100
        )
        : 0,
    };

    const recommendations = [];
    if (weakAreas.length > 0)
      recommendations.push("Focus more on the weak tags listed below.");
    if (difficultyPerformance.hard < 50)
      recommendations.push(
        "Improve your understanding of hard-level questions."
      );
    if (score < 70)
      recommendations.push("Consider revising the study material once more.");
    if (score === 100)
      recommendations.push(
        "Great job! Try exploring advanced topics for deeper learning."
      );

    // --------------------------------------------------------
    // GEMINI USING AXIOS (YOUR REQUIRED METHOD)
    // --------------------------------------------------------

    const prompt = `
Analyze the student's quiz performance.

Overall Score: ${score}%

Tag Scores:
${tagScoresArray
        .map(
          (t) => `${t.tag}: ${t.score}% (${t.correct}/${t.totalQuestions} correct)`
        )
        .join("\n")}

Difficulty Performance:
Easy: ${difficultyPerformance.easy}%
Medium: ${difficultyPerformance.medium}%
Hard: ${difficultyPerformance.hard}%

Provide response ONLY in JSON format like:
{
  "summary": "...",
  "advancedTips": ["...", "..."],
  "studyAdvice": ["...", "..."],
  "focusTags": ["tag1", "tag2"]
}
`;

    let geminiJson = {};

    try {
      const payload = { contents: [{ parts: [{ text: prompt }] }] };

      const geminiRes = await axios.post(
        `${GEMINI_URL}?key=${API_KEY}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 60000,
        }
      );

      const textOutput =
        geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      console.log("textop", textOutput);
      let cleaned = textOutput
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      geminiJson = JSON.parse(cleaned);


      console.log("op:", geminiJson);
    } catch (err) {
      console.log("Gemini error:", err);
      geminiJson = {
        summary: "Gemini could not generate insights.",
        advancedTips: [],
        studyAdvice: [],
        focusTags: [],
      };
    }

    // --------------------------------------------------------
    // FINAL RESPONSE SENT TO FRONTEND
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      overallScore: score,
      tagScores: tagScoresArray,
      resultId: savedQuizResult._id,
      tagScoreId: savedTagScores._id,

      analysis: {
        weakAreas,
        strongAreas,
        difficultyPerformance,
        recommendations,
        questionResults,
        gemini: geminiJson, // included Gemini output
      },
    });
  } catch (err) {
    console.error("Quiz submit error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to submit quiz" });
  }
};

