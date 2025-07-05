// const Post = require('../models/Post');
// const Quiz = require('../models/Quiz');
// const generateQuestions = require('../utils/textToQuiz');

// exports.generateQuizFromPosts = async (subject, userId) => {
//   const posts = await Post.find({ subject });
//   console.log(posts);
//   if (!posts.length) throw new Error("No approved posts found for this subject");

//   const content = posts.map(p => `${p.title}\n${p.description || p.message}`).join('\n\n');
//   const questions = await generateQuestions(content);

//   const quiz = await Quiz.create({ subject, questions, createdBy: userId });
//   return quiz;
// };
const Post = require('../models/Post');
const Quiz = require('../models/Quiz');
const generateQuestions = require('../utils/textToQuiz');

exports.generateQuizFromPosts = async (subject, userId) => {
  // Fetch posts with matching subject
  const posts = await Post.find({ subject });

  if (!posts.length) {
    throw new Error("No posts found for this subject");
  }

  // Prepare content for question generation
  const content = posts
    .map(p => {
      const title = p.title?.trim();
      const body = p.description?.trim() || p.message?.trim();
      if (!title || !body) return null; // Skip invalid posts
      return `${title}\n${body}`; // Combine title and content
    })
    .filter(Boolean) // Remove nulls
    .join('\n\n');

  if (!content) {
    throw new Error("No valid content found to generate quiz questions");
  }

  // Generate MCQs from combined content
  const questions = await generateQuestions(content);

  // Create quiz in DB
  const quiz = await Quiz.create({
    subject,
    questions,
    createdBy: userId,
  });

  return quiz;
};
