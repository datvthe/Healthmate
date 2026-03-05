const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Kết nối database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthmate');

const createAdmin = async () => {
  try {
    // Kiểm tra admin đã tồn tại chưa
    const existingAdmin = await User.findOne({ email: 'admin@healthmate.com' });
    if (existingAdmin) {
      console.log('Admin account already exists!');
      process.exit(0);
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Tạo admin user
    const admin = await User.create({
      email: 'admin@healthmate.com',
      password_hash: hashedPassword,
      role: 'admin',
      status: 'active',
      profile: {
        full_name: 'System Administrator',
        gender: 'other',
        height_cm: 170,
        weight_kg: 70,
        date_of_birth: new Date('1990-01-01'),
        phone_number: '+849012345678',
        address: 'Hanoi, Vietnam',
        bio: 'System administrator for HealthMate platform',
        picture: 'https://ui-avatars.com/api/?name=Admin&background=random'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: admin@healthmate.com');
    console.log('🔑 Password: admin123');
    console.log('🎯 Role: admin');
    console.log('📅 Created at:', admin.createdAt);

    // Tạo JWT token để test
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🎫 JWT Token:', token);
    console.log('\n🔗 Use this token to test admin APIs:');
    console.log('curl -H "Authorization: Bearer ' + token + '" http://localhost:8000/api/admin/dashboard');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

// Chạy hàm tạo admin
createAdmin();
