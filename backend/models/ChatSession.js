const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  started_at: { type: Date, default: Date.now },
  title: { type: String }, // Có thể cho AI tự đặt tên phiên chat (VD: "Tư vấn giảm mỡ")
  
  // Nhúng toàn bộ tin nhắn vào mảng này
  messages: [{
    sender: { type: String, enum: ['user', 'ai'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);