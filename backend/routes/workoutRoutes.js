const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Workout = require("../models/Workout");

const normalizeExercises = (exercises = []) => {
  if (!Array.isArray(exercises)) return [];
  return exercises
    .map((exercise, index) => ({
      title: exercise?.title || "",
      video_url: exercise?.video_url || "",
      duration_sec: Number(exercise?.duration_sec) || 60,
      order: Number(exercise?.order) || index + 1,
    }))
    .filter((exercise) => exercise.title.trim() !== "");
};

const normalizeProgramDays = (programDays = []) => {
  if (!Array.isArray(programDays)) return [];

  return programDays
    .map((day, index) => ({
      day_number: Number(day?.day_number) || index + 1,
      day_title: day?.day_title || `Day ${index + 1}`,
      exercises: normalizeExercises(day?.exercises || []),
    }))
    .sort((a, b) => a.day_number - b.day_number);
};

const normalizeWorkoutInput = (body = {}) => {
  const payload = { ...body };
  if (Object.prototype.hasOwnProperty.call(payload, "access_tier")) {
    payload.access_tier = ["free", "premium"].includes(payload.access_tier)
      ? payload.access_tier
      : "free";
  }

  if (Array.isArray(payload.program_days)) {
    payload.program_days = normalizeProgramDays(payload.program_days);
  }

  if (Array.isArray(payload.exercises)) {
    payload.exercises = normalizeExercises(payload.exercises);
  }

  // Keep backward compatibility for old screens that still read `exercises`.
  if (
    Array.isArray(payload.program_days) &&
    payload.program_days.length > 0 &&
    (!Array.isArray(payload.exercises) || payload.exercises.length === 0)
  ) {
    payload.exercises = payload.program_days[0].exercises;
  }

  return payload;
};

/*
========================================
CREATE WORKOUT
========================================
*/
router.post("/", async (req, res) => {
  try {
    const normalizedPayload = normalizeWorkoutInput(req.body);
    const workout = new Workout({
      ...normalizedPayload,
      cover_image: req.body.cover_image || "",
    });

    await workout.save();
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
========================================
GET ALL WORKOUTS (FILTER)
========================================
*/
router.get("/", async (req, res) => {
  try {
    const { category, level, search, access_tier } = req.query;

    const filter = {};

    // chỉ filter nếu field đó tồn tại trong schema
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category_id = category;
    }

    if (level) {
      filter.level = level;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (["free", "premium"].includes(access_tier)) {
      filter.access_tier = access_tier;
    }

    const workouts = await Workout.find(filter)
      .populate("category_id", "name")
      .sort({ createdAt: -1 });

    res.json(workouts);
  } catch (err) {
    console.error("GET WORKOUTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/*
========================================
GET WORKOUT BY ID
========================================
*/
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const workout = await Workout.findById(req.params.id).populate(
      "category_id",
      "name",
    );

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
========================================
UPDATE WORKOUT
========================================
*/
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const normalizedPayload = normalizeWorkoutInput(req.body);
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      {
        ...normalizedPayload,
        ...(Object.prototype.hasOwnProperty.call(req.body, "cover_image")
          ? { cover_image: req.body.cover_image || "" }
          : {}),
      },
      { new: true },
    );

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
========================================
DELETE WORKOUT
========================================
*/
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const workout = await Workout.findByIdAndDelete(req.params.id);

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
