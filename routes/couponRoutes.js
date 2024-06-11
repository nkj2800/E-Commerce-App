const express= require('express');
const router= express.Router();
const couponControllers= require('../controllers/couponController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');


router.post('/', protect, isAdmin, couponControllers.createCoupon);
router.get('/', protect, isAdmin, couponControllers.getAllCoupons);
router.put('/:id', protect, isAdmin, couponControllers.updateCoupon);
router.delete('/:id', protect, isAdmin, couponControllers.deleteCoupon);


module.exports= router;