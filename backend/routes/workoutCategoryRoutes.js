const express = require("express");
const router = express.Router();
const WorkoutCategory = require("../models/WorkoutCategory");

// CREATE CATEGORY
router.post("/", async (req, res) => {
  try {
    const category = new WorkoutCategory(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL CATEGORIES
router.get("/", async (req, res) => {
  try {
    const categories = await WorkoutCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE CATEGORY
router.put("/:id", async (req, res) => {
  try {
    const category = await WorkoutCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE CATEGORY
router.delete("/:id", async (req, res) => {
  try {
    await WorkoutCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
