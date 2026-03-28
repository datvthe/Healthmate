const express = require("express");
const router = express.Router();
const UserWorkout = require("../models/UserWorkout");
const Workout = require("../models/Workout");
const WorkoutLog = require("../models/WorkoutLog");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const {
  getSubscriptionSnapshot,
  syncExpiredSubscription,
} = require("../utils/subscriptionUtils");

const ensureUserContext = async (userId) => {
  const user = await User.findById(userId).select("profile subscription");
  if (!user) return null;
  await syncExpiredSubscription(user);
  return user;
};

const isWorkoutLocked = (workout, subscriptionSnapshot) =>
  workout?.access_tier === "premium" && !subscriptionSnapshot?.hasPremiumAccess;

// =============================
// 1) Workout library + calories + lock state
// =============================
router.get("/", protect, async (req, res) => {
  try {
    const { duration } = req.query;
    const user = await ensureUserContext(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const snapshot = getSubscriptionSnapshot(user);
    const weight = user.profile?.weight_kg || 70;
    const workouts = await Workout.find();

    const workoutsWithState = workouts.map((workout) => {
      const durationMinutes = parseInt(duration, 10) || workout.duration || 30;
      const estimatedCalories = workout.met * weight * (durationMinutes / 60);
      const locked = isWorkoutLocked(workout, snapshot);

      return {
        ...workout.toObject(),
        selectedDuration: durationMinutes,
        estimatedCalories: Math.round(estimatedCalories),
        is_locked: locked,
      };
    });

    res.json(workoutsWithState);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// 2) Add workout to personal list
// =============================
router.post("/", protect, async (req, res) => {
  try {
    const { workout_id, planned_duration } = req.body;
    const user = await ensureUserContext(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const workout = await Workout.findById(workout_id);
    if (!workout) {
      return res.status(404).json({ message: "Workout không tồn tại." });
    }

    const snapshot = getSubscriptionSnapshot(user);
    if (isWorkoutLocked(workout, snapshot)) {
      return res.status(403).json({
        message: "Bai tap premium. Vui long nang cap Pro hoac dang ky goi moi.",
      });
    }

    const existing = await UserWorkout.findOne({
      user_id: req.user.id,
      workout_id,
      status: { $ne: "completed" },
    });

    if (existing) {
      return res.status(400).json({
        message: "Workout đã tồn tại trong danh sách của bạn.",
      });
    }

    const newItem = await UserWorkout.create({
      user_id: req.user.id,
      workout_id,
      planned_duration,
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =============================
// 3) Get personal workout list
// =============================
router.get("/my", protect, async (req, res) => {
  try {
    const user = await ensureUserContext(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const snapshot = getSubscriptionSnapshot(user);
    const myWorkouts = await UserWorkout.find({
      user_id: req.user.id,
    }).populate("workout_id");

    const enriched = myWorkouts.map((item) => {
      const workout = item.workout_id;
      const locked = workout ? isWorkoutLocked(workout, snapshot) : false;
      return {
        ...item.toObject(),
        is_locked: locked,
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =============================
// 4) Start workout
// =============================
router.put("/start/:id", protect, async (req, res) => {
  try {
    const user = await ensureUserContext(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const snapshot = getSubscriptionSnapshot(user);
    const item = await UserWorkout.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    }).populate("workout_id");

    if (!item) {
      return res.status(404).json({ message: "Khong tim thay workout da luu." });
    }

    if (item.workout_id && isWorkoutLocked(item.workout_id, snapshot)) {
      return res.status(403).json({
        message: "Workout premium da het quyen truy cap. Vui long nang cap goi.",
      });
    }

    item.status = "in_progress";
    item.last_started_at = new Date();
    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =============================
// 5) Finish workout + create log
// =============================
router.put("/finish/:id", protect, async (req, res) => {
  try {
    const user = await ensureUserContext(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const snapshot = getSubscriptionSnapshot(user);
    const userWorkout = await UserWorkout.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    }).populate("workout_id");

    if (!userWorkout) {
      return res.status(404).json({ message: "Không tìm thấy workout" });
    }

    if (userWorkout.workout_id && isWorkoutLocked(userWorkout.workout_id, snapshot)) {
      return res.status(403).json({
        message: "Workout premium da het quyen truy cap. Vui long nang cap goi.",
      });
    }

    const duration = userWorkout.planned_duration;
    const met = userWorkout.workout_id?.met || 5;
    const weight = user.profile?.weight_kg || 70;
    const calories = met * weight * (duration / 60);

    await WorkoutLog.create({
      user_id: req.user.id,
      workout_id: userWorkout.workout_id._id,
      duration_minutes: duration,
      calories_burned: Math.round(calories),
    });

    userWorkout.status = "completed";
    await userWorkout.save();

    res.json({
      message: "Workout completed",
      calories_burned: Math.round(calories),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =============================
// 6) Delete from personal list
// =============================
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await UserWorkout.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Không tìm thấy workout để xóa.",
      });
    }

    res.json({ message: "Đã xóa workout khỏi danh sách." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
