const mongoose = require('mongoose');
const MealPlan = require('../models/MealPlan');
const Food = require('../models/Food');

// ID tạm dùng khi chưa đăng nhập (tạm thời bỏ yêu cầu auth)
const GUEST_USER_ID = new mongoose.Types.ObjectId('000000000000000000000001');

const recalculateTotalCalories = (items) => {
  return items.reduce((total, item) => total + (item.calories || 0), 0);
};

const parseDate = (dateStr) => {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getMealPlanByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user?._id || GUEST_USER_ID;

    const targetDate = parseDate(date);
    const mealPlan = await MealPlan.findOne({ user_id: userId, date: targetDate });

    if (!mealPlan) {
      return res.json({ user_id: userId, date: targetDate, total_calories: 0, items: [] });
    }

    res.json(mealPlan);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const addFoodToMealPlan = async (req, res) => {
  try {
    const { date } = req.params;
    const { food_id, quantity } = req.body;
    const userId = req.user?._id || GUEST_USER_ID;

    if (!food_id || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Vui lòng cung cấp food_id và quantity hợp lệ' });
    }

    const food = await Food.findById(food_id);
    if (!food) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }

    const itemCalories = Math.round((food.calories * quantity) / 100);
    const targetDate = parseDate(date);

    let mealPlan = await MealPlan.findOne({ user_id: userId, date: targetDate });

    if (!mealPlan) {
      mealPlan = new MealPlan({ user_id: userId, date: targetDate, items: [] });
    }

    mealPlan.items.push({ food_id: food._id, name: food.name, quantity, calories: itemCalories });
    mealPlan.total_calories = recalculateTotalCalories(mealPlan.items);

    await mealPlan.save();
    res.status(201).json({ message: 'Thêm món ăn thành công', mealPlan });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const removeFoodFromMealPlan = async (req, res) => {
  try {
    const { date, itemId } = req.params;
    const userId = req.user?._id || GUEST_USER_ID;

    const targetDate = parseDate(date);
    const mealPlan = await MealPlan.findOne({ user_id: userId, date: targetDate });

    if (!mealPlan) {
      return res.status(404).json({ message: 'Không tìm thấy thực đơn cho ngày này' });
    }

    const itemIndex = mealPlan.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn trong thực đơn' });
    }

    mealPlan.items.splice(itemIndex, 1);
    mealPlan.total_calories = recalculateTotalCalories(mealPlan.items);

    await mealPlan.save();
    res.json({ message: 'Xóa món ăn thành công', mealPlan });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const updateFoodQuantity = async (req, res) => {
  try {
    const { date, itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?._id || GUEST_USER_ID;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
    }

    const targetDate = parseDate(date);
    const mealPlan = await MealPlan.findOne({ user_id: userId, date: targetDate });

    if (!mealPlan) {
      return res.status(404).json({ message: 'Không tìm thấy thực đơn cho ngày này' });
    }

    const item = mealPlan.items.find(item => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn trong thực đơn' });
    }

    const food = await Food.findById(item.food_id);
    if (!food) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin món ăn gốc' });
    }

    item.quantity = quantity;
    item.calories = Math.round((food.calories * quantity) / 100);
    mealPlan.total_calories = recalculateTotalCalories(mealPlan.items);

    await mealPlan.save();
    res.json({ message: 'Cập nhật số lượng thành công', mealPlan });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  getMealPlanByDate,
  addFoodToMealPlan,
  removeFoodFromMealPlan,
  updateFoodQuantity
};
