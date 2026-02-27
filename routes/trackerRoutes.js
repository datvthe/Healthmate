const express = require('express');
const router = express.Router();
const {
  saveWorkoutLog,
  getWorkoutLogs,
  updateBodyProgress,
  getBodyProgress,
  getDashboardStats
} = require('../controllers/trackerController');
const { protect } = require('../middleware/authMiddleware');

// Middleware bảo vệ tất cả các routes
router.use(protect);

// Workout Logs
router.post('/workouts', saveWorkoutLog);                    // Lưu lịch sử bài tập
router.get('/workouts', getWorkoutLogs);                     // Lấy lịch sử bài tập

// Body Progress
router.post('/body-progress', updateBodyProgress);           // Cập nhật chỉ số cơ thể
router.get('/body-progress', getBodyProgress);              // Lấy dữ liệu tiến trình cơ thể

// Dashboard Statistics
router.get('/dashboard-stats', getDashboardStats);           // Thống kê tổng hợp cho dashboard

module.exports = router;
