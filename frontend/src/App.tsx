import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AiCoachPage from './pages/AiCoachPage';
import FoodCatalogPage from './pages/FoodCatalogPage';
import MealPlannerPage from './pages/MealPlannerPage';

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

        {/* Meal Planner */}
        <Route path="/meal-planner" element={<MealPlannerPage />} />
        
        {/* Nơi thêm các đường dẫn khác sau này */}
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}