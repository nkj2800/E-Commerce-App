const express = require('express');
const router = express.Router();
const brandControllers = require('../controllers/brandController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');



router.post('/', protect, isAdmin, brandControllers.createBrand);
router.put('/:id', protect, isAdmin, brandControllers.updateBrand);
router.delete('/:id', protect, isAdmin, brandControllers.deleteBrand);
router.get('/:id', brandControllers.getBrand);
router.get('/', brandControllers.getAllBrands);



module.exports = router;