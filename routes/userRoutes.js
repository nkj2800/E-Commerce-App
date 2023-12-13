const express= require('express');
const router= express.Router();
const userControllers= require('../controllers/userControllers');
const {isAdmin, protect}= require('../middlewares/authMiddleware');


router.post('/register', userControllers.registerUser);
router.post('/login', userControllers.loginUser);
router.get('/all-users', protect, isAdmin, userControllers.getAllUsers);
router.get('/', protect, userControllers.getUser);
router.delete('/', protect, userControllers.deleteUser);
router.put('/', protect, userControllers.updateUser);
router.put('/block/:id', protect, isAdmin, userControllers.blockUser);
router.put('/unblock/:id', protect, isAdmin, userControllers.unblockUser);
router.put('/password', protect, userControllers.updatePassword);
router.post('/forgot-password-token', userControllers.forgotPasswordToken);
router.put('/reset-password/:token', userControllers.resetPassword);
router.get('/refresh', userControllers.handleRefreshToken);
router.get('/logout', userControllers.logout);

module.exports= router;