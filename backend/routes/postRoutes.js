const express = require('express');
const router = express.Router();
const {
  create,
  getAllPosts,
  getOne,
  update,
  remove,
  getPendingPosts,
  approvePost,like
} = require('../controllers/postController');

const { protect, allowRoles } = require('../auth/rbac');

// Admin-only routes (STATIC FIRST ✅)
router.get('/admin/pending', protect, allowRoles('admin'), getPendingPosts);
router.put('/admin/approve/:postId', protect, allowRoles('admin'), approvePost);

// Then dynamic
router.get('/', protect, getAllPosts);
router.get('/:id', protect, getOne);
router.post('/', protect, create);
router.put('/:id/like', protect, like);
router.put('/:id', protect, allowRoles('admin'), update);
router.delete('/:id', protect, allowRoles('admin'), remove);


module.exports = router;
