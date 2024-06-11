const express = require('express');
const productControllers = require('../controllers/productController');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const { uploadPhoto, productImageResize } = require('../middlewares/uploadImages');


router.post('/', protect, isAdmin, productControllers.createProduct);
router.put('/upload/:id', protect, isAdmin, uploadPhoto.array('images', 10), productImageResize, productControllers.uploadImages);
router.put('/wishlist', protect, productControllers.addToWishlist);
router.put('/rating', protect, productControllers.rating);
router.get('/:id', productControllers.getProduct);
router.get('/', productControllers.getAllProducts);
router.put('/:id', protect, isAdmin, productControllers.updateProduct);
router.delete('/:id', protect, isAdmin, productControllers.deleteProduct);


module.exports = router; 
