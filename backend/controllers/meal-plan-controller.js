const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const MealPlan = require('../models/MealPlan');
const Food = require('../models/Food');
const User = require('../models/User');
const Goal = require('../models/goalModel');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const recalculateTotalCalories = (items) => {
  return items.reduce((total, item) => total + (item.calories || 0), 0);
};

const checkIsPastDate = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const todayStr = new Date(today.getTime() - tzOffset).toISOString().split('T')[0];
    return dateStr < todayStr;
};

const resolveUserId = (req) => {
  const targetId = req.body?.target_user_id || req.query?.target_user_id;
  if (req.user.role === 'admin' && targetId) {
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      const err = new Error('target_user_id không hợp lệ');
      err.status = 400; throw err;
    }
    return new mongoose.Types.ObjectId(targetId);
  }
  return new mongoose.Types.ObjectId(req.user.id);
};

const getMealPlanByDate = async (req, res) => {
  try {
    const date = req.params.date || req.query.date;
    const userId = resolveUserId(req);
    let mealPlan = await MealPlan.findOne({ user_id: userId, date });
    if (!mealPlan) mealPlan = { user_id: userId, date, items: [], total_calories: 0 };
    res.json(mealPlan);
  } catch (error) {
    res.status(error.status || 500).json({ message: "Lỗi khi lấy thực đơn", error: error.message });
  }
};

const addFoodToMealPlan = async (req, res) => {
  try {
    const date = req.params.date || req.body.date;
    const { food_id, quantity, slot } = req.body;

    if (checkIsPastDate(date)) return res.status(400).json({ message: "Không thể thêm món ăn vào ngày trong quá khứ." });

    const userId = resolveUserId(req);
    const food = await Food.findById(food_id);
    if (!food) return res.status(404).json({ message: "Không tìm thấy món ăn" });

    let mealPlan = await MealPlan.findOne({ user_id: userId, date });
    if (!mealPlan) mealPlan = new MealPlan({ user_id: userId, date, items: [] });

    const calories = Math.round((food.calories * quantity) / 100);
    mealPlan.items.push({ food_id, name: food.name, quantity, calories, slot });
    mealPlan.total_calories = recalculateTotalCalories(mealPlan.items);

    await mealPlan.save();
    res.json(mealPlan);
  } catch (error) {
    res.status(error.status || 500).json({ message: "Lỗi khi thêm món ăn", error: error.message });
  }
};

const updateMealItem = async (req, res) => {
  try {
    const date = req.params.date || req.body.date;
    const item_id = req.params.id || req.params.itemId || req.body.item_id;
    const { quantity } = req.body;

    if (checkIsPastDate(date)) return res.status(400).json({ message: "Không thể sửa món ăn trong quá khứ." });
    if (!quantity || quantity <= 0) return res.status(400).json({ message: "Số lượng không hợp lệ." });

    const userId = resolveUserId(req);
    let mealPlan = await MealPlan.findOne({ user_id: userId, date });
    if (!mealPlan) return res.status(404).json({ message: "Không tìm thấy thực đơn" });

    const itemIndex = mealPlan.items.findIndex(i => i._id.toString() === item_id);
    if (itemIndex === -1) return res.status(404).json({ message: "Không tìm thấy món ăn" });

    const calPerGram = mealPlan.items[itemIndex].calories / mealPlan.items[itemIndex].quantity;
    mealPlan.items[itemIndex].quantity = quantity;
    mealPlan.items[itemIndex].calories = Math.round(calPerGram * quantity);

    mealPlan.total_calories = recalculateTotalCalories(mealPlan.items);
    await mealPlan.save();
    res.json(mealPlan);
  } catch (error) {
    res.status(error.status || 500).json({ message: "Lỗi cập nhật món ăn", error: error.message });
  }
};

const removeFoodFromMealPlan = async (req, res) => {
  try {
    const date = req.params.date || req.body.date;
    const item_id = req.params.id || req.params.itemId || req.body.item_id;

    if (checkIsPastDate(date)) return res.status(400).json({ message: "Không thể xóa món ăn trong quá khứ." });

    const userId = resolveUserId(req);
    let mealPlan = await MealPlan.findOne({ user_id: userId, date });
    if (!mealPlan) return res.status(404).json({ message: "Không tìm thấy thực đơn" });

    mealPlan.items = mealPlan.items.filter(item => item._id.toString() !== item_id);
    mealPlan.total_calories = recalculateTotalCalories(mealPlan.items);
    await mealPlan.save();
    res.json(mealPlan);
  } catch (error) {
    res.status(error.status || 500).json({ message: "Lỗi xóa món ăn", error: error.message });
  }
};

const checkIsPro = (user) => {
    if (!user || !user.subscription) return false;
    return user.subscription.plan === 'pro' && new Date(user.subscription.endDate) > new Date();
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getAgeFromBirthDate = (birthDate) => {
  if (!birthDate) return 25;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return 25;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return clamp(age, 15, 80);
};

const getBmiCategory = (bmi) => {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
};

const calculateCalorieTargetFromBmiAndGoal = ({ weight, height, gender, age, goalType }) => {
  const safeWeight = clamp(Number(weight) || 70, 20, 300);
  const safeHeight = clamp(Number(height) || 170, 120, 230);
  const safeAge = clamp(Number(age) || 25, 15, 80);
  const safeGender = ['male', 'female', 'other'].includes(gender) ? gender : 'male';

  const heightM = safeHeight / 100;
  const bmi = safeWeight / (heightM * heightM);
  const bmiCategory = getBmiCategory(bmi);

  const bmrBase = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge;
  const bmr = safeGender === 'female' ? bmrBase - 161 : bmrBase + 5;
  const tdee = bmr * 1.45;

  let goalDelta = 0;
  if (goalType === 'fat_loss') goalDelta = -500;
  else if (goalType === 'muscle_gain') goalDelta = 300;
  else if (goalType === 'endurance') goalDelta = 150;

  let bmiDelta = 0;
  if (bmiCategory === 'underweight') bmiDelta = 200;
  if (bmiCategory === 'overweight') bmiDelta = goalType === 'fat_loss' ? -200 : -100;
  if (bmiCategory === 'obese') bmiDelta = goalType === 'fat_loss' ? -300 : -200;

  const lowerBound = safeGender === 'female' ? 1200 : 1400;
  const upperBound = 3800;
  const targetCalories = Math.round(clamp(tdee + goalDelta + bmiDelta, lowerBound, upperBound));

  return {
    bmi: Number(bmi.toFixed(1)),
    bmiCategory,
    targetCalories,
  };
};

// 🔴 API ĐẦU BẾP AI (ĐÃ FIX PROMPT VÀ LỖI JSON)
const generateAIPlan = async (req, res) => {
    try {
        const { date } = req.body;
        if (checkIsPastDate(date)) return res.status(400).json({ message: "Không thể nhờ AI thiết kế cho quá khứ." });

        const user = await User.findById(req.user.id);
        if (!checkIsPro(user)) return res.status(403).json({ message: "Tính năng này chỉ dành cho gói Pro." });

        const activeGoal = await Goal.findOne({ user_id: user._id, status: 'active' }).sort({ updatedAt: -1 }).lean();
        const goalType = activeGoal?.goal_type || user.profile?.goal || 'maintain';
        const weight = user.profile?.weight_kg || 70;
        const height = user.profile?.height_cm || 170;
        const gender = user.profile?.gender || 'male';
        const age = getAgeFromBirthDate(user.profile?.birth_date);
        const { bmi, bmiCategory, targetCalories } = calculateCalorieTargetFromBmiAndGoal({
          weight,
          height,
          gender,
          age,
          goalType
        });

        const foods = await Food.find().limit(60);
        if (foods.length === 0) return res.status(400).json({ message: "Thư viện món ăn rỗng." });

        const prompt = `Bạn là chuyên gia dinh dưỡng cá nhân hóa. Hãy tạo thực đơn 1 ngày bám sát calories mục tiêu.
        THÔNG TIN NGƯỜI DÙNG:
        - Goal: ${goalType}
        - Weight: ${weight}kg
        - Height: ${height}cm
        - BMI: ${bmi} (${bmiCategory})
        - Target calories/day: ${targetCalories} kcal

        BẮT BUỘC CHỈ CHỌN các món ăn trong danh sách sau (giữ đúng _id và name):
        ${JSON.stringify(foods.map(f => ({_id: f._id, name: f.name, cal: f.calories})))}

        Trả về ĐÚNG định dạng JSON object, tuyệt đối không có \`\`\`json ở đầu/cuối:
        {
          "meta": {"target_calories": ${targetCalories}, "bmi": ${bmi}, "bmi_category": "${bmiCategory}", "goal_type": "${goalType}"},
          "suggestions": [{"_id":"...","name":"...","calories":...,"quantity":100}],
          "breakfast": [{"_id":"...","name":"...","calories":...,"quantity":100,"reason":"..."}],
          "lunch": [{"_id":"...","name":"...","calories":...,"quantity":100,"reason":"..."}],
          "dinner": [{"_id":"...","name":"...","calories":...,"quantity":100,"reason":"..."}],
          "snack": [{"_id":"...","name":"...","calories":...,"quantity":100,"reason":"..."}]
        }

        RÀNG BUỘC:
        - Tổng calories cả ngày nên gần ${targetCalories} kcal (dao động ±120 kcal).
        - Goal fat_loss: ưu tiên món no lâu, đạm cao, giảm món quá nhiều calo.
        - Goal muscle_gain: ưu tiên đủ đạm, carb chất lượng và đủ năng lượng.
        - Goal maintain/endurance: cân bằng, dễ duy trì.
        - Lý do (reason) ngắn gọn, cụ thể theo BMI + goal.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const resultAI = await model.generateContent(prompt);
        
        // 🔴 XỬ LÝ LỖI TRÍCH XUẤT JSON AN TOÀN
        let text = resultAI.response.text();
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        let suggestions = {};
        try {
            suggestions = JSON.parse(text);
        } catch (e) {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                suggestions = JSON.parse(text.substring(start, end + 1));
            } else {
                throw new Error("AI trả về sai định dạng JSON.");
            }
        }
        if (!suggestions || typeof suggestions !== 'object' || Array.isArray(suggestions)) {
          suggestions = {};
        }
        suggestions.meta = {
          target_calories: Number(suggestions?.meta?.target_calories) || targetCalories,
          bmi: Number(suggestions?.meta?.bmi) || bmi,
          bmi_category: suggestions?.meta?.bmi_category || bmiCategory,
          goal_type: suggestions?.meta?.goal_type || goalType,
        };
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: "Lỗi tạo AI menu", error: error.message });
    }
};

const analyzeCaloriesLimit = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!checkIsPro(user)) return res.json({ feedback: "" });

        const { totalCalories, targetCalories, goalType, currentWeight } = req.body;
        const diff = totalCalories - targetCalories;
        if (diff < 0) return res.json({ feedback: "" });

        const prompt = `Bạn là HLV cá nhân. Học viên mục tiêu: ${goalType}. Nặng: ${currentWeight}kg. Đã nạp ${totalCalories} kcal, VƯỢT MỨC ${targetCalories} kcal (Dư ${diff} kcal). Khuyên ngắn gọn 1 câu tiếng Việt.`;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const resultAI = await model.generateContent(prompt);
        res.json({ feedback: resultAI.response.text() });
    } catch (error) { res.status(500).json({ message: "Lỗi AI", error: error.message }); }
};

module.exports = {
  getMealPlanByDate, addFoodToMealPlan, removeFoodFromMealPlan, generateAIPlan, analyzeCaloriesLimit,
  updateMealItem, updateFoodQuantity: updateMealItem, updateItemQuantity: updateMealItem, updateQuantity: updateMealItem
};
