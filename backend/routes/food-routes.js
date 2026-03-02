const express = require('express');
const router = express.Router();
const {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood
} = require('../controllers/food-controller');
const upload = require('../middleware/food-upload');

// Public routes
router.get('/', getAllFoods);
router.get('/:id', getFoodById);

// Admin routes (cần auth middleware gắn req.user)
// upload.single('image') xử lý multipart/form-data, field name là 'image'
router.post('/', upload.single('image'), createFood);
router.put('/:id', upload.single('image'), updateFood);
router.delete('/:id', deleteFood);

module.exports = router;
