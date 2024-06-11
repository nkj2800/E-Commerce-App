const express = require('express');
const router = express.Router();
const blogControllers = require('../controllers/blogControllers');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const {uploadPhoto, blogImageResize}= require('../middlewares/uploadImages');


router.post('/', protect, isAdmin, blogControllers.createBlog);
router.put('/upload/:id', protect, isAdmin, uploadPhoto.array('images', 2), blogImageResize, blogControllers.uploadImages);
router.put('/likes', protect, isAdmin, blogControllers.likeBlog);
router.put('/dislikes', protect, isAdmin, blogControllers.dislikeBlog)
router.put('/:id', protect, isAdmin, blogControllers.updateBlog);
router.get('/:id', blogControllers.getBlog);
router.get('/', blogControllers.getAllBlogs);
router.delete('/:id', protect, isAdmin, blogControllers.deleteBlog);


module.exports = router;