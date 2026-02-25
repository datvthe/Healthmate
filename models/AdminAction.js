const mongoose = require('mongoose');

const adminActionSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE'], required: true },
  target_collection: { type: String, required: true }, // Tên bảng bị tác động (VD: 'Food', 'Workout')
  target_id: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID của món ăn/bài tập bị sửa
}, { timestamps: true });

module.exports = mongoose.model('AdminAction', adminActionSchema);