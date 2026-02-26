import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AiCoachPage from './pages/AiCoachPage';
import FoodCatalogPage from './pages/FoodCatalogPage';
import MealPlannerPage from './pages/MealPlannerPage';
import AdminFoodFormPage from './pages/AdminFoodFormPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

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
      </Routes>
    </BrowserRouter>
  );
}
