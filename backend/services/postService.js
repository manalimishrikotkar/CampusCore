const Post = require('../models/Post');

const createPost = async (data, userId) => {
  return await Post.create({ ...data, createdBy: userId });
};

const getPosts = async () => {
  return await Post.find().populate('createdBy', 'name email').sort({createdAt:-1});
};

const getPostById = async (id) => {
  return await Post.findById(id).populate('createdBy', 'name email');
};

const updatePost = async (id, data) => {
  return await Post.findByIdAndUpdate(id, data, { new: true });
};

const deletePost = async (id) => {
  return await Post.findByIdAndDelete(id);
};


const likePost = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error('Post not found');

  if (post.likedBy.includes(userId)) {
    throw new Error('You have already liked this post');
  }

  post.likes += 1;
  post.likedBy.push(userId);

  await post.save();
  return post;
};


module.exports = { createPost, getPosts, getPostById, updatePost, deletePost,likePost };
// Post service logic 
