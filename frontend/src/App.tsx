import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AiCoachPage from './pages/AiCoachPage';
// Sau này có trang Admin thì bạn import ở đây, vd: import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn mặc định (trang chủ) - Tạm thời điều hướng thẳng sang trang aicoach */}
        <Route path="/" element={<Navigate to="/aicoach" replace />} />
        
        {/* Đường dẫn tĩnh cho trang AI Coach */}
        <Route path="/aicoach" element={<AiCoachPage />} />
        
        {/* Nơi thêm các đường dẫn khác sau này */}
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}