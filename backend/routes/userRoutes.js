const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getUsers,
  googleLogin,
  getDailyRoutine,
  updateDailyRoutine,
  getHealthMetrics, // <-- FIX 1: Import hàm này vào
  updateAvatar,
} = require("../controllers/userController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "healthmate_avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
  },
});
const uploadAvatar = multer({ storage: avatarStorage });

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);

// User profile 
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.put("/me/avatar", protect, uploadAvatar.single("avatar"), updateAvatar);
router.get("/me/health-metrics", protect, getHealthMetrics); // <-- FIX 2: Khai báo route
router.put("/profile", protect, updateProfile);

// Daily routine
router.get("/me/daily-routine", protect, getDailyRoutine);
router.put("/me/daily-routine", protect, updateDailyRoutine);

// Admin
router.get("/", protect, adminOnly, getUsers);

module.exports = router;
