const WorkoutLog = require('../models/WorkoutLog');
const BodyProgress = require('../models/BodyProgress');
const Workout = require('../models/Workout');

// [POST] Lưu lịch sử bài tập sau khi user hoàn thành
const saveWorkoutLog = async (req, res) => {
  try {
    const { workout_id, duration_minutes, calories_burned, notes } = req.body;
    const user_id = req.user.id;

    if (!workout_id || !duration_minutes || !calories_burned) {
      return res.status(400).json({
        message: 'Thiếu thông tin bắt buộc: workout_id, duration_minutes, calories_burned'
      });
    }

    // Kiểm tra workout có tồn tại không
    const workout = await Workout.findById(workout_id);
    if (!workout) {
      return res.status(404).json({ message: 'Không tìm thấy bài tập' });
    }

    const workoutLog = await WorkoutLog.create({
      user_id,
      workout_id,
      duration_minutes,
      calories_burned,
      notes
    });

    // Populate thông tin workout để trả về
    const populatedLog = await WorkoutLog.findById(workoutLog._id)
      .populate('workout_id', 'name description category');

    res.status(201).json({
      message: 'Lưu lịch sử bài tập thành công!',
      workoutLog: populatedLog
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [GET] Lấy lịch sử bài tập của user
const getWorkoutLogs = async (req, res) => {
  try {
    const { period = 'week', limit = 10 } = req.query;
    const user_id = req.user.id;

    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const workoutLogs = await WorkoutLog.find({
      user_id,
      date: { $gte: startDate }
    })
    .populate('workout_id', 'name category')
    .sort({ date: -1 })
    .limit(parseInt(limit));

    const totalCalories = workoutLogs.reduce((sum, log) => sum + log.calories_burned, 0);
    const totalDuration = workoutLogs.reduce((sum, log) => sum + log.duration_minutes, 0);

    res.json({
      workoutLogs,
      summary: {
        totalWorkouts: workoutLogs.length,
        totalCalories,
        totalDuration,
        averageCaloriesPerWorkout: workoutLogs.length > 0 ? Math.round(totalCalories / workoutLogs.length) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [POST] Cập nhật cân nặng và chỉ số cơ thể
const updateBodyProgress = async (req, res) => {
  try {
    const { weight_kg, body_fat_percentage, note } = req.body;
    const user_id = req.user.id;

    if (!weight_kg || weight_kg <= 0) {
      return res.status(400).json({ message: 'Cân nặng phải lớn hơn 0' });
    }

    const bodyProgress = await BodyProgress.create({
      user_id,
      weight_kg,
      body_fat_percentage,
      note
    });

    res.status(201).json({
      message: 'Cập nhật chỉ số cơ thể thành công!',
      bodyProgress
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [GET] Lấy dữ liệu tiến trình cơ thể để vẽ biểu đồ
const getBodyProgress = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const user_id = req.user.id;

    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (period === 'all') {
      startDate = new Date(0); // Lấy tất cả dữ liệu
    }

    const bodyProgress = await BodyProgress.find({
      user_id,
      date: { $gte: startDate }
    })
    .sort({ date: 1 });

    // Tính toán sự thay đổi
    const weightChange = bodyProgress.length >= 2 
      ? bodyProgress[bodyProgress.length - 1].weight_kg - bodyProgress[0].weight_kg
      : 0;

    res.json({
      bodyProgress,
      summary: {
        totalEntries: bodyProgress.length,
        currentWeight: bodyProgress.length > 0 ? bodyProgress[bodyProgress.length - 1].weight_kg : null,
        weightChange: Math.round(weightChange * 10) / 10,
        startWeight: bodyProgress.length > 0 ? bodyProgress[0].weight_kg : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [GET] Lấy thống kê tổng hợp cho dashboard
const getDashboardStats = async (req, res) => {
  try {
    const user_id = req.user.id;
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);

    // Lấy workout logs trong tuần
    const weekWorkouts = await WorkoutLog.find({
      user_id,
      date: { $gte: weekStart }
    }).populate('workout_id', 'name category');

    // Lấy body progress gần nhất
    const latestBodyProgress = await BodyProgress.findOne({
      user_id
    }).sort({ date: -1 });

    // Lấy workout logs hôm nay
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayWorkouts = await WorkoutLog.find({
      user_id,
      date: { $gte: todayStart, $lte: todayEnd }
    }).populate('workout_id', 'name category');

    const weekCalories = weekWorkouts.reduce((sum, log) => sum + log.calories_burned, 0);
    const weekDuration = weekWorkouts.reduce((sum, log) => sum + log.duration_minutes, 0);

    res.json({
      today: {
        workoutsCompleted: todayWorkouts.length,
        caloriesBurned: todayWorkouts.reduce((sum, log) => sum + log.calories_burned, 0),
        duration: todayWorkouts.reduce((sum, log) => sum + log.duration_minutes, 0),
        workoutDetails: todayWorkouts
      },
      week: {
        totalWorkouts: weekWorkouts.length,
        totalCalories: weekCalories,
        totalDuration: weekDuration,
        averageCaloriesPerDay: Math.round(weekCalories / 7),
        averageDurationPerDay: Math.round(weekDuration / 7)
      },
      body: {
        currentWeight: latestBodyProgress?.weight_kg || null,
        lastUpdated: latestBodyProgress?.date || null,
        bodyFatPercentage: latestBodyProgress?.body_fat_percentage || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  saveWorkoutLog,
  getWorkoutLogs,
  updateBodyProgress,
  getBodyProgress,
  getDashboardStats
};
