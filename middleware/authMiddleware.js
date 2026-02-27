const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware bảo vệ route: yêu cầu người dùng gửi kèm JWT hợp lệ
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!process.env.JWT_SECRET) {
        return res
          .status(500)
          .json({ message: 'Thiếu cấu hình JWT_SECRET trong server.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Lưu thông tin user id vào req để controller sử dụng
      req.user = { id: decoded.id };

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối.' });
  }
};

module.exports = {
  protect
};

