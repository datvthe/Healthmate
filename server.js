require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Kết nối database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);

const foodRoutes = require('./routes/food-routes');
app.use('/api/foods', foodRoutes);

const mealPlanRoutes = require('./routes/meal-plan-routes');
app.use('/api/meal-plans', mealPlanRoutes);

// API test thử
app.get('/', (req, res) => {
  res.send('Healthmate API đang chạy thành công! 🚀');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});