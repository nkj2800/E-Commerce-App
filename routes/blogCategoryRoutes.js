const express = require('express');
const router = express.Router();
const blogCategoryControllers = require('../controllers/blogCategoryController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');



router.post('/', protect, isAdmin, blogCategoryControllers.createCategory);
router.put('/:id', protect, isAdmin, blogCategoryControllers.updateCategory);
router.delete('/:id', protect, isAdmin, blogCategoryControllers.deleteCategory);
router.get('/:id', blogCategoryControllers.getCategory);
router.get('/', blogCategoryControllers.getAllCategories);



module.exports = router;