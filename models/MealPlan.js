const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // Đánh index để truy vấn thực đơn của user nhanh hơn
  },
  date: { 
    type: Date, 
    required: true 
  },
  total_calories: { 
    type: Number, 
    default: 0 
  },
  // Nhúng danh sách món ăn vào thực đơn (Giải quyết quan hệ N-M)
  items: [{
    food_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Food' // Sẽ tạo model Food sau nếu cần quản lý kho thực phẩm riêng
    },
    name: { type: String, required: true }, // Lưu tên trực tiếp để render nhanh
    quantity: { type: Number, required: true }, // Số lượng (gram, ml...)
    calories: { type: Number, required: true } // Calo tương ứng với quantity
  }]
}, { timestamps: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);