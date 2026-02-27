require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Kết nối database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5174'], 
    credentials: true
}));
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);

const trackerRoutes = require('./routes/trackerRoutes');
app.use('/api/tracker', trackerRoutes);

const workoutRoutes = require('./routes/workoutRoutes');
app.use('/api/workouts', workoutRoutes);

// API test thử
app.get('/', (req, res) => {
  res.send('Healthmate API đang chạy thành công! 🚀');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});