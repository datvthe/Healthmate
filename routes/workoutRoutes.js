const express = require("express");
const router = express.Router();
const Workout = require("../models/Workout");

// CREATE WORKOUT
router.post("/", async (req, res) => {
  try {
    const workout = new Workout(req.body);
    await workout.save();
    console.log("BODY:", req.body);
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const { category, level, search } = req.query;

    let filter = {};

    if (category) filter.category_id = category;
    if (level) filter.level = level;

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const workouts = await Workout.find(filter)
      .populate("category_id")
      .populate("created_by", "name");

    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id).populate(
      "category_id",
    );

    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    await Workout.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
