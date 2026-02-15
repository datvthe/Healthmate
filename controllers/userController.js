const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// [POST] Đăng ký người dùng mới
const registerUser = async (req, res) => {
  try {
    const { email, password, profile } = req.body;

    // 1. Kiểm tra xem email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được sử dụng!' });
    }

    // 2. Mã hóa mật khẩu (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tạo user mới và lưu vào DB
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      profile // Chứa full_name, gender, height_cm... từ form gửi lên
    });

    // 4. Trả về kết quả (Không trả về password_hash)
    res.status(201).json({
      message: 'Đăng ký tài khoản thành công!',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  registerUser
};