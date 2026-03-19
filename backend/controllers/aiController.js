const { GoogleGenerativeAI } = require("@google/generative-ai");
const Workout = require("../models/Workout");
const User = require("../models/User");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.recommendWorkout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔥 lấy workout từ DB
    const library = await Workout.find();

    console.log("🔥 LIBRARY LENGTH:", library.length);

    const height = user.profile?.height_cm;
    const weight = user.profile?.weight_kg;
    const goal = user.profile?.goal;

    const bmi =
      height && weight
        ? (weight / ((height / 100) ** 2)).toFixed(1)
        : "unknown";

    const bodyType =
      bmi < 18.5
        ? "underweight"
        : bmi < 25
        ? "normal"
        : "overweight";

    const prompt = `
Bạn là HLV fitness chuyên nghiệp.

Thông tin người dùng:
- Chiều cao: ${height} cm
- Cân nặng: ${weight} kg
- BMI: ${bmi}
- Thể trạng: ${bodyType}
- Mục tiêu: ${goal}

Danh sách bài tập:
${library.map((w) => `- ${w.title || w.name}`).join("\n")}

⚠️ BẮT BUỘC:
- Chỉ chọn từ danh sách trên
- Không giải thích
- Không thêm text

Chỉ trả JSON:
["Tên bài 1", "Tên bài 2"]
`;

    // 🔥 dùng SDK giống chat
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const resultAI = await model.generateContent(prompt);
    const text = resultAI.response.text();

    console.log("🔥 AI RAW:", text);

    const clean = text.replace(/```json|```/g, "").trim();

    let names = [];

    try {
      names = JSON.parse(clean);
    } catch {
      console.log("❌ JSON parse fail");
      names = [];
    }

    console.log("🔥 PARSED:", names);

    const normalize = (str) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, "");

    const result = names
      .map((name) =>
        library.find((w) =>
          normalize(w.title || w.name).includes(normalize(name))
        )
      )
      .filter(Boolean);

    return res.json(result);
  } catch (err) {
    console.error("🔥 AI ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};