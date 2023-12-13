const express = require('express');
const productControllers = require('../controllers/productController');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');


router.post('/', protect, isAdmin, productControllers.createProduct);
router.get('/:id', productControllers.getProduct);
router.get('/', productControllers.getAllProducts);
router.put('/:id', protect, isAdmin, productControllers.updateProduct);
router.delete('/:id', protect, isAdmin, productControllers.deleteProduct);


module.exports = router; 
