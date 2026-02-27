import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AiCoachPage from './pages/AiCoachPage';

import FoodCatalogPage from './pages/FoodCatalogPage';
import MealPlannerPage from './pages/MealPlannerPage';
import AdminFoodFormPage from './pages/AdminFoodFormPage';
import AdminDashboardPage from './pages/AdminDashboardPage';


import WorkoutsPage from './pages/WorkoutsPage'; // Import trang WorkoutsPage
import WorkoutDetailPage from "./pages/WorkoutDetailPage";

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
// Sau này có trang Admin thì bạn import ở đây, vd: import AdminDashboard from './pages/AdminDashboard';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/aicoach" replace />} />
        <Route path="/aicoach" element={<AiCoachPage />} />
        <Route path="/foods" element={<FoodCatalogPage />} />
        <Route path="/meal-planner" element={<MealPlannerPage />} />
        <Route path="/dashboard" element={<AdminDashboardPage />} />
        <Route path="/dashboard/foods/new" element={<AdminFoodFormPage />} />

        {/* Đường dẫn mặc định (trang chủ) - điều hướng sang trang đăng nhập */}
        <Route path="/" element={<Navigate to="/homepage" replace />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Hồ sơ cá nhân */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Đường dẫn tĩnh cho trang AI Coach */}
        <Route path="/aicoach" element={<AiCoachPage />} />

        {/* Nơi thêm các đường dẫn khác sau này */}
         {/* Route mới cho Workouts */}
        <Route path="/workouts" element={<WorkoutsPage />} />
        <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
        <Route path='/homepage' element={<HomePage/>} />

      </Routes>
    </BrowserRouter>
  );
}
