const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const WorkoutLog = require('../models/WorkoutLog');
const {
  createTrialEndDate,
  syncExpiredSubscription,
  toClientSubscription,
} = require("../utils/subscriptionUtils");

const buildUserResponse = (user) => ({
  _id: user._id,
  email: user.email,
  role: user.role,
  profile: user.profile,
  subscription: toClientSubscription(user),
});

// Hàm tiện ích để tạo JWT cho user
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Thiếu cấu hình JWT_SECRET trong .env");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// [POST] Đăng ký người dùng mới
const registerUser = async (req, res) => {
  try {
    const { email, password, profile } = req.body;

    if (!email || !password || !profile?.full_name) {
      return res.status(400).json({
        message: "Email, mật khẩu và họ tên là bắt buộc.",
      });
    }

    // 1. Kiểm tra xem email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }

    // 2. Mã hóa mật khẩu (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tạo user mới và lưu vào DB
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      subscription: {
        plan: "trial",
        endDate: createTrialEndDate(),
      },
      profile, // Chứa full_name, gender, height_cm... từ form gửi lên
    });

    // 4. Tạo token đăng nhập luôn sau khi đăng ký
    const token = generateToken(user._id);

    // 5. Trả về kết quả (Không trả về password_hash)
    res.status(201).json({
      message: "Đăng ký tài khoản thành công!",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [POST] Đăng nhập
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ email và mật khẩu." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng." });
    }

    if (user.status === "banned") {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng." });
    }

    await syncExpiredSubscription(user);
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: "Đăng nhập thành công",
      token: generateToken(user._id),
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [GET] Thông tin user hiện tại (hồ sơ cá nhân)
// Yêu cầu: đã qua middleware bảo vệ (req.user đã tồn tại)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
    await syncExpiredSubscription(user);

    res.json(buildUserResponse(user));
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


const updateDailyRoutine = async (req, res) => {
  try {
    const { date, exercises, source } = req.body;

    if (!date || typeof date !== "string") {
      return res.status(400).json({ message: "Thiếu ngày tập hợp lệ." });
    }

    // Optional guard: manual edits cannot change future days (view-only).
    // We only enforce this for explicit manual update flows to keep roadmap
    // auto-scheduling (Day 2, Day 3,...) working as expected.
    if (source === "manual_edit") {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayLocal = `${year}-${month}-${day}`;
      if (date > todayLocal) {
        return res.status(403).json({
          message: "Ngày trong tương lai chỉ xem, không thể chỉnh sửa thủ công.",
        });
      }
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ĐOẠN FIX: Khởi tạo mảng nếu user chưa có daily_routine trong database
    if (!user.daily_routine) {
      user.daily_routine = [];
    }

    const existing = user.daily_routine.find((d) => d.date === date);

    if (existing) {
      existing.exercises = exercises;
    } else {
      user.daily_routine.push({ date, exercises });
    }

    await user.save();

    res.json({ message: "Daily routine updated" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [PUT] Cập nhật daily routine
const getDailyRoutine = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = {};

    if (user.daily_routine && user.daily_routine.length > 0) {
      user.daily_routine.forEach((day) => {
        result[day.date] = day.exercises;
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [PUT] Cập nhật hồ sơ cá nhân
// Body dự kiến: { profile: { full_name, gender, height_cm, weight_kg, goal } }
const updateProfile = async (req, res) => {
  try {
    const { profile } = req.body;

    if (!profile) {
      return res.status(400).json({ message: "Thiếu dữ liệu profile để cập nhật." });
    }

    // --- BỔ SUNG VALIDATE Ở BACKEND ---
    if (profile.height_cm) {
        if (Number(profile.height_cm) < 50 || Number(profile.height_cm) > 250) {
            return res.status(400).json({ message: "Chiều cao không hợp lệ (Giới hạn: 50 - 250 cm)." });
        }
    }
    if (profile.weight_kg) {
        if (Number(profile.weight_kg) < 20 || Number(profile.weight_kg) > 300) {
            return res.status(400).json({ message: "Cân nặng không hợp lệ (Giới hạn: 20 - 300 kg)." });
        }
    }
    if (profile.gender && !['male', 'female', 'other'].includes(profile.gender)) {
        return res.status(400).json({ message: "Giới tính không hợp lệ." });
    }
    if (profile.full_name && profile.full_name.trim().length === 0) {
        return res.status(400).json({ message: "Họ tên không được để trống." });
    }
    // ----------------------------------

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    // Gộp profile cũ và mới (cho phép cập nhật từng phần)
    user.profile = {
      ...user.profile,
      ...profile,
    };

    const updatedUser = await user.save();

    res.json({
      message: "Cập nhật hồ sơ thành công!",
      profile: updatedUser.profile,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [PUT] Cập nhật avatar người dùng
// Hỗ trợ:
// - multipart/form-data với file field "avatar"
// - hoặc JSON body { picture: "https://..." }
const updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    const uploadedPicture = req.file?.path;
    const pictureFromBody = req.body?.picture;

    const nextPicture = uploadedPicture || pictureFromBody;
    if (!nextPicture || typeof nextPicture !== "string") {
      return res.status(400).json({ message: "Thiếu ảnh avatar hợp lệ." });
    }

    user.profile = {
      ...user.profile,
      picture: nextPicture.trim(),
    };

    const updatedUser = await user.save();

    res.json({
      message: "Cập nhật avatar thành công!",
      profile: updatedUser.profile,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
const googleLogin = async (req, res) => {
  try {
    const { email, full_name, sub } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Không lấy được email từ Google." });
    }

    // Kiểm tra user đã tồn tại chưa
    let user = await User.findOne({ email });

    if (!user) {
      // Mã hóa một mật khẩu ngẫu nhiên cho user Google vì Schema bắt buộc có password_hash
      const salt = await bcrypt.genSalt(10);
      const randomPassword = await bcrypt.hash(
        sub || Math.random().toString(),
        salt,
      );

      user = await User.create({
        email,
        password_hash: randomPassword,
        subscription: {
          plan: "trial",
          endDate: createTrialEndDate(),
        },
        profile: {
          full_name: full_name || "Người dùng Google",
        },
      });
    } else if (user.status === "banned") {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa." });
    }

    await syncExpiredSubscription(user);
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: "Đăng nhập Google thành công!",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [GET] Danh sách customers (admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("_id email profile.full_name profile.goal profile.weight_kg profile.height_cm profile.gender profile.birth_date")
      .sort({ "profile.full_name": 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
const getHealthMetrics = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const p = user.profile || {};
    const weight = p.weight_kg || 70;
    const height = p.height_cm || 170;
    const gender = p.gender || 'male';
    const age = 25; // Tạm giả định 25 tuổi nếu không có ngày sinh

    // 1. Tính BMR (Basal Metabolic Rate) bằng công thức Mifflin-St Jeor
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr = gender === 'female' ? bmr - 161 : bmr + 5;

    // 2. Tính Calo tập luyện hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayWorkouts = await WorkoutLog.find({ user_id: user._id, date: { $gte: today } });
    const todayActiveCal = todayWorkouts.reduce((sum, w) => sum + w.calories_burned, 0);

    // Metabolic Rate = BMR cơ bản + Calo vận động
    const metabolicRate = Math.round(bmr + todayActiveCal);

    // 3. Lấy dữ liệu 7 ngày qua cho biểu đồ Workout Impact
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);

    const pastWorkouts = await WorkoutLog.find({
      user_id: user._id,
      date: { $gte: sevenDaysAgo },
    }).populate({ path: "workout_id", select: "title name" });

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const toDateKey = (value) => {
      const dateValue = new Date(value);
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, "0");
      const day = String(dateValue.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const groupedByDate = new Map();
    for (const workout of pastWorkouts) {
      const key = toDateKey(workout.date);
      const current = groupedByDate.get(key) || {
        minutes: 0,
        calories: 0,
        workoutCount: 0,
        activities: [],
      };

      current.minutes += Number(workout.duration_minutes) || 0;
      current.calories += Number(workout.calories_burned) || 0;
      current.workoutCount += 1;
      current.activities.push(
        workout.workout_id?.title || workout.workout_id?.name || "Workout session",
      );
      groupedByDate.set(key, current);
    }

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - i);
      const dateKey = toDateKey(dayDate);
      const daySummary = groupedByDate.get(dateKey) || {
        minutes: 0,
        calories: 0,
        workoutCount: 0,
        activities: [],
      };

      const minsThatDay = Math.round(daySummary.minutes);
      const caloriesThatDay = Math.round(daySummary.calories);
      const uniqueActivities = Array.from(new Set(daySummary.activities));
      let activityLevel = "rest";
      if (minsThatDay >= 75) activityLevel = "high";
      else if (minsThatDay >= 30) activityLevel = "medium";
      else if (minsThatDay > 0) activityLevel = "light";

      chartData.push({
        day: days[dayDate.getDay()],
        date: dateKey,
        dateLabel: `${months[dayDate.getMonth()]} ${dayDate.getDate()}`,
        minutes: minsThatDay,
        calories: caloriesThatDay,
        workoutCount: daySummary.workoutCount,
        activities: uniqueActivities,
        activityLevel,
        status: minsThatDay > 0 ? "Active" : "Rest",
        // Giữ lại để tương thích UI cũ nếu cần
        heightPercent: Math.min((minsThatDay / 120) * 100, 100) || 5,
      });
    }

    // 4. Giả lập Recovery & Sleep (Sau này có thể tạo bảng SleepLog để lưu số liệu thật)
    // Nếu hôm nay tập nhiều -> Điểm phục hồi giảm
    const recoveryScore = Math.max(100 - (todayActiveCal / 20), 40).toFixed(0); 
    const sleepHours = 7;
    const sleepMins = 45 - (todayWorkouts.length * 5); // Random logic cho vui
    
    // Đánh giá nguy cơ chấn thương
    const injuryRisk = parseInt(recoveryScore) < 60 ? 'High' : parseInt(recoveryScore) < 80 ? 'Medium' : 'Low';

    res.json({
      metabolicRate,
      recoveryScore,
      sleep: `${sleepHours}h ${sleepMins}m`,
      chartData,
      injuryRisk
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getUsers,
  googleLogin,
  getDailyRoutine,
  updateDailyRoutine,
  getHealthMetrics,
  updateAvatar,
};
