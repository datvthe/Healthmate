const express = require('express');
const router = express.Router();
const {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood
} = require('../controllers/food-controller');

// Public routes
router.get('/', getAllFoods);
router.get('/:id', getFoodById);

// Admin routes (cần auth middleware gắn req.user)
router.post('/', createFood);
router.put('/:id', updateFood);
router.delete('/:id', deleteFood);

module.exports = router;
