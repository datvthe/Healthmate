import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AiCoachPage from './pages/AiCoachPage';
import FoodCatalogPage from './pages/FoodCatalogPage';
import MealPlannerPage from './pages/MealPlannerPage';
import AdminFoodFormPage from './pages/AdminFoodFormPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
          },
          success: {
            iconTheme: {
              primary: '#a3e635',
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e293b',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/aicoach" replace />} />
        <Route path="/aicoach" element={<AiCoachPage />} />
        <Route path="/foods" element={<FoodCatalogPage />} />
        <Route path="/meal-planner" element={<MealPlannerPage />} />
        <Route path="/dashboard" element={<AdminDashboardPage />} />
        <Route path="/dashboard/foods/new" element={<AdminFoodFormPage />} />
        <Route path="/dashboard/foods/:id" element={<AdminFoodFormPage />} />
      </Routes>
    </BrowserRouter>
  );
}
