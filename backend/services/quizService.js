const Post = require('../models/Post');
const Quiz = require('../models/Quiz');
const generateQuestions = require('../utils/textToQuiz');

const mongoose = require("mongoose");

// Separate OCR DB connection
const ocrConnection = mongoose.createConnection(
  process.env.MONGO_URI_OCR || "mongodb://localhost:27017/ocr_database",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// OCR schema and model
const OCRResult = ocrConnection.model(
  "ocr_results",
  new mongoose.Schema({
    file_url: String,
    markdown: String,
    tags_used: [String],
    timestamp: Date,
  }),
  "ocr_results"
);

// // Segment for each quiz portion
// const SegmentSubSchema = new mongoose.Schema(
//   {
//     segmentNumber: { type: Number, required: true },   // 1,2,3...
//     pageStart: { type: Number, required: true },       // starting page number
//     pageEnd: { type: Number, required: true },         // ending page number
//     text: { type: String, required: true }             // OCR text for pages in this segment
//   },
//   { _id: false }
// );

// // Main segmented OCR schema
// const OCRSegmentSchema = new mongoose.Schema(
//   {
//     ocr_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "ocr_results",
//       required: true
//     },

//     postId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Post",
//       required: true
//     },

//     file_url: {
//       type: String,
//       required: true
//     },

//     segments: {
//       type: [SegmentSubSchema],
//       required: true
//     },

//     timestamp: {
//       type: Date,
//       default: Date.now
//     }
//   },
//   { collection: "ocr_segments" }
// );

// const OCRSegments = ocrConnection.model("ocr_segments", OCRSegmentSchema);


// exports.generateQuizForPost = async (postId, userId, subject,tags) => {
//   try {
    

//     const post = await Post.findById(postId);
//     if (!post || !post.file?.url) throw new Error("Post or file not found");

//     // 🧩 Avoid regenerating quiz if it already exists
//     const existingQuiz = await Quiz.findOne({ subject: post.subject, createdBy: userId ,tags: post.tags});
//     if (existingQuiz) {
//       console.log("⚠️ Quiz already exists for this note. Skipping generation.");
//       return existingQuiz;
//     }

//     // Find OCR document
//     const ocrDoc = await OCRResult.findOne({ file_url: post.file.url });
//     if (!ocrDoc) throw new Error("No OCR content found for this note");

//     const textContent = ocrDoc.markdown;
//     console.log("textContent",textContent);
//     if (!textContent || textContent.trim().length < 50)
//       throw new Error("OCR content too short to generate quiz");

//     const questions = await generateQuestions(textContent);

//     const quiz = await Quiz.create({
//       postId: post._id,
//       subject: subject || post.subject || "General",
//       tags: Array.isArray(tags)
//   ? tags.join(", ")
//   : tags || post.tags?.toString() || "General",

//       questions,
//       createdBy: userId,
//     });
//     console.log("😘quizz",quiz);
//     return quiz;
//   } catch (err) {
//     console.error("❌ Error in generateQuizForPost:", err.message);
//     throw err;
//   }
// };

exports.generateQuizForPost = async (postId, userId, subject) => {
  try {
    const post = await Post.findById(postId);
    if (!post || !post.file?.url) throw new Error("Post or file not found");

    // Avoid duplicate quiz
    const existingQuiz = await Quiz.findOne({
      postId: postId,
      createdBy: userId,
    });

    if (existingQuiz) {
      console.log("⚠️ Quiz already exists for this note. Skipping generation.");
      return existingQuiz;
    }

    // Extract OCR text
    const ocrDoc = await OCRResult.findOne({ file_url: post.file.url });
    if (!ocrDoc) throw new Error("No OCR content found for this note");

    const textContent = ocrDoc.markdown;
    if (!textContent || textContent.trim().length < 50)
      throw new Error("OCR content too short to generate quiz");

    // Generate AI quiz questions
    const rawQuestions = await generateQuestions(textContent,post.tags);

    // Add fallback defaults so schema doesn't break
    const questions = rawQuestions.map(q => ({
      question: q.question,
      options: q.options,
      answer: q.answer,
      tag: q.tag || "general",
      difficulty: q.difficulty || "medium",
    }));

    // Create quiz
    const quiz = await Quiz.create({
      postId: post._id,
      subject: subject || post.subject || "General",
      questions,
      createdBy: userId,
    });

    return quiz;

  } catch (err) {
    console.error("❌ Error in generateQuizForPost:", err.message);
    throw err;
  }
};



// exports.generateQuizFromPosts = async (subject, userId) => {
//   // Fetch posts with matching subject
//   const posts = await Post.find({ subject });

//   if (!posts.length) {
//     throw new Error("No posts found for this subject");
//   }

//   // Prepare content for question generation
//   const content = posts
//     .map(p => {
//       const title = p.title?.trim();
//       const body = p.description?.trim() || p.message?.trim();
//       if (!title || !body) return null; // Skip invalid posts
//       return `${title}\n${body}`; // Combine title and content
//     })
//     .filter(Boolean) // Remove nulls
//     .join('\n\n');

//   if (!content) {
//     throw new Error("No valid content found to generate quiz questions");
//   }
  

//   console.log(generateQuestions(content));
//   // Generate MCQs from combined content
//   const questions = await generateQuestions(content);

//   // Create quiz in DB
//   const quiz = await Quiz.create({
//     subject,
//     questions,
//     createdBy: userId,
//   });

//   return quiz;
// };
