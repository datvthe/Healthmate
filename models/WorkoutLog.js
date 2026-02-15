const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  workout_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', required: true },
  date: { type: Date, default: Date.now },
  duration_minutes: { type: Number, required: true }, // Thời gian tập thực tế
  calories_burned: { type: Number, required: true },  // Calo đốt được thực tế
  notes: { type: String } // User ghi chú: "Hôm nay tập hơi mệt..."
}, { timestamps: true });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);