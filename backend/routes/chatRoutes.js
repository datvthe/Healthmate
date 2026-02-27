const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Nhớ thêm middleware xác thực token (authMiddleware) vào trước controller nếu có
router.post('/ask', chatController.askAICoach);

module.exports = router;