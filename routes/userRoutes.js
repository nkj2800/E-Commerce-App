const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');
const { isAdmin, protect } = require('../middlewares/authMiddleware');


router.post('/register', userControllers.registerUser);
router.post('/login', userControllers.loginUser);
router.post('/admin-login', userControllers.loginAdmin);
router.post('/cart', protect, userControllers.addToCart);
router.post('/cart/apply-coupon', protect, userControllers.applyCoupon);
router.post('/cart/cash-order', protect, userControllers.createCashOrder);
router.get('/all-users', protect, isAdmin, userControllers.getAllUsers);
router.get('/', protect, userControllers.getUser);
router.get('/orders', protect, userControllers.getOrders);
router.delete('/', protect, userControllers.deleteUser);
router.put('/', protect, userControllers.updateUser);
router.put('/save-address', protect, userControllers.saveAddress);
router.put('/update-order/:id', protect, isAdmin, userControllers.updateOrderStatus);
router.put('/block/:id', protect, isAdmin, userControllers.blockUser);
router.put('/unblock/:id', protect, isAdmin, userControllers.unblockUser);
router.put('/password', protect, userControllers.updatePassword);
router.get('/wishlist', protect, userControllers.getWishlist);
router.get('/cart', protect, userControllers.getCart);
router.delete('/empty-cart', protect, userControllers.emptyCart)
router.post('/forgot-password-token', userControllers.forgotPasswordToken);
router.put('/reset-password/:token', userControllers.resetPassword);
router.get('/refresh', userControllers.handleRefreshToken);
router.get('/logout', userControllers.logout);

module.exports = router;