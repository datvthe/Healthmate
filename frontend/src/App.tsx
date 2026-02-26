import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AiCoachPage from './pages/AiCoachPage';
import FoodCatalogPage from './pages/FoodCatalogPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn mặc định (trang chủ) - Tạm thời điều hướng thẳng sang trang aicoach */}
        <Route path="/" element={<Navigate to="/aicoach" replace />} />
        
        {/* Đường dẫn tĩnh cho trang AI Coach */}
        <Route path="/aicoach" element={<AiCoachPage />} />

        {/* Food Catalog */}
        <Route path="/foods" element={<FoodCatalogPage />} />
        
        {/* Nơi thêm các đường dẫn khác sau này */}
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}