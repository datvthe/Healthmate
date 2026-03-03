const express = require('express');
const router = express.Router();
const {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood
} = require('../controllers/food-controller');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllFoods);
router.get('/:id', getFoodById);

// Admin routes (cần auth + quyền admin)
router.post('/', protect, requireAdmin, createFood);
router.put('/:id', protect, requireAdmin, updateFood);
router.delete('/:id', protect, requireAdmin, deleteFood);

module.exports = router;
