const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getUsers
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Đăng ký tài khoản mới
router.post('/register', registerUser);

// Đăng nhập
router.post('/login', loginUser);

// Lấy thông tin user hiện tại (hồ sơ cá nhân)
router.get('/me', protect, getMe);

// Cập nhật hồ sơ cá nhân
router.put('/me', protect, updateProfile);

// Lấy danh sách customers (admin only)
router.get('/', protect, adminOnly, getUsers);

module.exports = router;
