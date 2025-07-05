const Post = require('../models/Post');
const User = require('../models/User');

exports.getLeaderboard = async () => {
  // Get all posts with author info populated
  const posts = await Post.find().populate('createdBy', 'name');

  // Map to store userId → { name, topLikes }
  const topPostsByUser = {};

  posts.forEach(post => {
    const userId = post.createdBy?._id?.toString();
    const name = post.createdBy?.name;

    if (!userId) return;

    const currentTop = topPostsByUser[userId];
    if (!currentTop || post.likes > currentTop.topLikes) {
      topPostsByUser[userId] = {
        name,
        topLikes: post.likes,
      };
    }
  });

  // Convert to array and sort
  const leaderboard = Object.values(topPostsByUser)
    .sort((a, b) => b.topLikes - a.topLikes);

  return leaderboard;
};