const WorkoutLog = require("../models/WorkoutLog");
const Workout = require("../models/Workout");
const User = require("../models/User");
const {
  getSubscriptionSnapshot,
  syncExpiredSubscription,
} = require("../utils/subscriptionUtils");

const toLocalDateString = (dateObj) => {
  const offset = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - offset).toISOString().split("T")[0];
};

const parseDateInput = (dateStr) => {
  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// CREATE WORKOUT LOG
const createWorkoutLog = async (req, res) => {
  try {
    const { workout_id, duration_minutes, calories_burned, notes, start_time, date } = req.body;

    let targetDate = new Date();

    if (date) {
      const parsedDate = parseDateInput(date);
      if (!parsedDate) {
        return res
          .status(400)
          .json({ message: "Định dạng ngày không hợp lệ (YYYY-MM-DD)." });
      }

      const targetDateStr = toLocalDateString(parsedDate);
      const todayStr = toLocalDateString(new Date());

      // Chi cho phep log dung ngay hien tai, khong cho qua khu/tuong lai.
      if (targetDateStr !== todayStr) {
        return res.status(400).json({
          message: "Chi duoc luu ket qua tap luyen cho ngay hom nay.",
        });
      }

      targetDate = parsedDate;
    }

    const missing = [];
    if (workout_id == null) missing.push("workout_id");
    if (duration_minutes == null) missing.push("duration_minutes");
    if (calories_burned == null) missing.push("calories_burned");

    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    const workoutExists = await Workout.findById(workout_id);
    if (!workoutExists) return res.status(404).json({ message: "Workout not found" });

    const user = await User.findById(req.user.id).select("subscription");
    if (!user) return res.status(404).json({ message: "User not found" });
    await syncExpiredSubscription(user);

    const snapshot = getSubscriptionSnapshot(user);
    if (workoutExists.access_tier === "premium" && !snapshot.hasPremiumAccess) {
      return res.status(403).json({
        message: "Workout premium da het quyen truy cap. Vui long nang cap goi.",
      });
    }

    const log = await WorkoutLog.create({
      user_id: req.user.id,
      workout_id,
      duration_minutes,
      calories_burned,
      notes,
      start_time,
      date: targetDate,
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY WORKOUT LOGS
const getMyWorkoutLogs = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ user_id: req.user.id }).populate("workout_id", "title cover_image category_id level calories_burned duration description exercises");
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createWorkoutLog, getMyWorkoutLogs };
