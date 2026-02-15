const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/userController');

// Khai báo API đăng ký
router.post('/register', registerUser);

module.exports = router;