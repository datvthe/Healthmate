const express = require('express');
const router = express.Router();
const {
  getMealPlanByDate,
  addFoodToMealPlan,
  removeFoodFromMealPlan,
  updateFoodQuantity
} = require('../controllers/meal-plan-controller');

// Tất cả routes cần auth (req.user)
router.get('/:date', getMealPlanByDate);
router.post('/:date/items', addFoodToMealPlan);
router.delete('/:date/items/:itemId', removeFoodFromMealPlan);
router.put('/:date/items/:itemId', updateFoodQuantity);

module.exports = router;
