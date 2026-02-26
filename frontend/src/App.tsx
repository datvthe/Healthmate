import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AiCoachPage from './pages/AiCoachPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
// Sau này có trang Admin thì bạn import ở đây, vd: import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn mặc định (trang chủ) - điều hướng sang trang đăng nhập */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Hồ sơ cá nhân */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Đường dẫn tĩnh cho trang AI Coach */}
        <Route path="/aicoach" element={<AiCoachPage />} />

        {/* Nơi thêm các đường dẫn khác sau này */}
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}