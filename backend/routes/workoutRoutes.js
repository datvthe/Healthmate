const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const { protect } = require('../middleware/authMiddleware');

// Middleware bảo vệ tất cả các routes (Yêu cầu phải có token mới được truy cập)
// Nếu bạn muốn test API mà chưa có tính năng Login, hãy thêm // vào trước dòng dưới để tắt nó đi
router.use(protect);

// [GET] Lấy tất cả workouts (Đã gộp tính năng filter, search và populate)
router.get('/', async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let filter = {};

    if (category) filter.category_id = category;
    if (level) filter.level = level;

    // Tìm kiếm theo tên bài tập
    if (search) {
      // Dùng $or để tìm cả theo trường name hoặc title (đề phòng 2 người dùng tên trường khác nhau)
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } }
      ];
    }

    const workouts = await Workout.find(filter)
      .populate("category_id")
      .populate("created_by", "name")
      .sort({ createdAt: -1 });

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// [POST] Tạo workout mới
router.post('/', async (req, res) => {
  try {
    const workout = new Workout(req.body);
    await workout.save();

    res.status(201).json({
      message: 'Tạo workout thành công!',
      workout
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// [GET] Lấy workout theo ID
router.get('/:id', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id).populate("category_id");
    
    if (!workout) {
      return res.status(404).json({ message: 'Không tìm thấy workout' });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// [PUT] Cập nhật workout
router.put('/:id', async (req, res) => {
  try {
    const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true, 
      runValidators: true
    });

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
});

// [DELETE] Xóa workout
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Không tìm thấy workout' });
    }

    res.json({ message: 'Xóa workout thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;