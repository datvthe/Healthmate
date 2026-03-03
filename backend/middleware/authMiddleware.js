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

      // Tải đầy đủ thông tin user để dùng cho phân quyền
      const user = await User.findById(decoded.id).select('-password_hash');

      if (!user) {
        return res.status(401).json({ message: 'Người dùng không tồn tại.' });
      }

      if (user.status === 'banned') {
        return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa.' });
      }

      req.user = user;

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối.' });
  }
};

// Middleware chỉ cho phép admin truy cập
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin mới được phép thực hiện thao tác này.' });
  }
  next();
};

module.exports = {
  protect,
  requireAdmin
};

