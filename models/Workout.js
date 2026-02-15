const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  category_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WorkoutCategory',
    required: true
  },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  calories_burned: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String 
  },
  created_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' // Admin ID
  },
  // Nhúng mảng video bài tập chi tiết ngay bên trong (Quan hệ 1-N)
  exercises: [{
    title: { type: String, required: true },
    video_url: { type: String, required: true },
    duration_sec: { type: Number, required: true },
    order: { type: Number, required: true } // Thứ tự bài tập (1, 2, 3...)
  }]
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);