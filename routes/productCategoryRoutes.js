const express = require('express');
const router = express.Router();
const productCategoryControllers = require('../controllers/productCategoryController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');



router.post('/', protect, isAdmin, productCategoryControllers.createCategory);
router.put('/:id', protect, isAdmin, productCategoryControllers.updateCategory);
router.delete('/:id', protect, isAdmin, productCategoryControllers.deleteCategory);
router.get('/:id', productCategoryControllers.getCategory);
router.get('/', productCategoryControllers.getAllCategories);



module.exports = router;