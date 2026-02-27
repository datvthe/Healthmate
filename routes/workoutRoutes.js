const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const { protect } = require('../middleware/authMiddleware');

// Middleware bảo vệ tất cả các routes
router.use(protect);

// [GET] Lấy tất cả workouts
const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({}).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [POST] Tạo workout mới
const createWorkout = async (req, res) => {
  try {
    const { name, description, category, duration, calories, difficulty } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: 'Thiếu thông tin bắt buộc: name, category'
      });
    }

    const workout = await Workout.create({
      name,
      description,
      category,
      duration: duration || 30,
      calories: calories || 200,
      difficulty: difficulty || 'Beginner'
    });

    res.status(201).json({
      message: 'Tạo workout thành công!',
      workout
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [GET] Lấy workout theo ID
const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Không tìm thấy workout' });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [PUT] Cập nhật workout
const updateWorkout = async (req, res) => {
  try {
    const { name, description, category, duration, calories, difficulty } = req.body;
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      { name, description, category, duration, calories, difficulty },
      { new: true, runValidators: true }
    );

    if (!workout) {
      return res.status(404).json({ message: 'Không tìm thấy workout' });
    }

    res.json({
      message: 'Cập nhật workout thành công!',
      workout
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [DELETE] Xóa workout
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Không tìm thấy workout' });
    }

    res.json({
      message: 'Xóa workout thành công!',
      workout
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Routes
router.get('/', getWorkouts);
router.post('/', createWorkout);
router.get('/:id', getWorkoutById);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

module.exports = router;
