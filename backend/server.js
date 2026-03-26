require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const { Server } = require('socket.io');
const http = require('http');

// Import Routes
const workoutRoutes = require("./routes/workoutRoutes");
const workoutCategoryRoutes = require("./routes/workoutCategoryRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const foodRoutes = require("./routes/food-routes");
const mealPlanRoutes = require("./routes/meal-plan-routes");
const progressRoutes = require("./routes/progressRoutes");
const workoutLogRoutes = require("./routes/workoutLogRoutes");
const userWorkoutRoutes = require("./routes/userWorkouts");
const goalRoutes = require("./routes/goalRoutes");
const microGoalRoutes = require("./routes/microGoalRoutes");
const aiRoutes = require("./routes/aiRoutes");
const communityRoutes = require("./routes/community");
const subscriptionRoutes = require("./routes/subscriptionRoutes");

// Kết nối database
connectDB();

// 1. KHAI BÁO CÁC DOMAIN ĐƯỢC PHÉP TRUY CẬP
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://healthmate-wdp.vercel.app" // <-- Domain Vercel của bạn
];

const app = express();
const server = http.createServer(app);

// 2. CẤU HÌNH CORS CHO SOCKET.IO
const io = new Server(server, { 
  cors: { 
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // BẮT BUỘC PHẢI CÓ
  } 
});

app.use((req, res, next) => {
  req.io = io; 
  next();
});

// 3. CẤU HÌNH CORS CHO EXPRESS API
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // BẮT BUỘC PHẢI CÓ
  })
);

app.use(express.json());

// Serve uploaded static files
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Khai báo sử dụng Routes
app.use("/api/workouts", workoutRoutes);
app.use("/api/workout-categories", workoutCategoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/workout-logs", workoutLogRoutes);
app.use("/api/user/user-workouts", userWorkoutRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/micro-goals", microGoalRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// API test thử
app.get("/", (req, res) => {
  res.send("Healthmate API đang chạy thành công! 🚀");
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server & Socket đang chạy tại http://localhost:${PORT}`);
});

// Lắng nghe kết nối socket
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});