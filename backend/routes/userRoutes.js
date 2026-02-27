const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Đăng ký tài khoản mới
router.post('/register', registerUser);

// Đăng nhập
router.post('/login', loginUser);

// Lấy thông tin user hiện tại (hồ sơ cá nhân)
router.get('/me', protect, getMe);

// Cập nhật hồ sơ cá nhân
router.put('/me', protect, updateProfile);

module.exports = router;
