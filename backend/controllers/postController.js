
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,likePost
} = require('../services/postService');


const Post = require('../models/Post');

const create = async (req, res) => {
  const { title, message, subject, semester, tags } = req.body;
  //console.log(user._id)
  const userId = req.user._id; // Comes from JWT middleware
  const userRole = req.user.role;
  //console.log(userId)
  const approvalStatus = userRole === 'admin' ? 'approved' : 'pending';
  const post = await createPost(req.body, req.user.id);
  res.status(201).json({
    success: true,
    message: approvalStatus === 'pending' 
      ? "Post submitted for admin approval" 
      : "Post published",
    data: post,
  });
};



const getAllPosts = async (req, res) => {
  const posts = await Post.find({ approvalStatus: 'approved' }).populate('createdBy', 'name');
  res.status(200).json({ success: true, data: posts });
};



const getOne = async (req, res) => {
  const post = await getPostById(req.params.id);
  res.json(post);
};

const update = async (req, res) => {
  const post = await updatePost(req.params.id, req.body);
  res.json(post);
};

const remove = async (req, res) => {
  await deletePost(req.params.id);
  res.json({ msg: 'Post deleted' });
};


const getPendingPosts = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const posts = await Post.find({ approvalStatus: 'pending' }).populate('createdBy', 'name');
  res.status(200).json({ success: true, data: posts });
};


const approvePost = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can approve posts' });
  }

  const post = await Post.findByIdAndUpdate(
    req.params.postId,
    { approvalStatus: 'approved' },
    { new: true }
  );

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  res.status(200).json({ message: 'Post approved', data: post });
};


const like = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await likePost(postId, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Post liked successfully',
      data: post
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = { create, getAllPosts, getOne, update, remove ,getPendingPosts,approvePost,like};
// Post controller 
