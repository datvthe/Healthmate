import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; // Import chú bảo vệ

// --- Import các trang ---
import AiCoachPage from './pages/AiCoachPage';
import FoodCatalogPage from './pages/FoodCatalogPage';
import MealPlannerPage from './pages/MealPlannerPage';
import AdminFoodFormPage from './pages/AdminFoodFormPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import WorkoutsPage from './pages/WorkoutsPage';
import WorkoutDetailPage from "./pages/WorkoutDetailPage";
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/*PUBLIC ROUTES */}
       
        <Route path="/" element={<Navigate to="/homepage" replace />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />


       
        {/*  PROTECTED ROUTES (Bắt buộc đăng nhập)*/}
        
        <Route element={<ProtectedRoute />}>
          {/* user */}
          <Route path="/aicoach" element={<AiCoachPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/foods" element={<FoodCatalogPage />} />
          <Route path="/meal-planner" element={<MealPlannerPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
          
          {/* Admin */}
          <Route path="/dashboard" element={<AdminDashboardPage />} />
          <Route path="/dashboard/foods/new" element={<AdminFoodFormPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}