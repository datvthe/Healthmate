const mongoose = require('mongoose');

const bodyProgressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, default: Date.now },
  weight_kg: { type: Number, required: true },
  body_fat_percentage: { type: Number }, // Tỷ lệ mỡ (Không bắt buộc)
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BodyProgress', bodyProgressSchema);