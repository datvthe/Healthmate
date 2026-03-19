const express = require("express");
const router = express.Router();

const { recommendWorkout } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// tất cả cần login
router.post("/recommend", protect, recommendWorkout);

module.exports = router;