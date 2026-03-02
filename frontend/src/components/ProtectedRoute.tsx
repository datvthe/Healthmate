// frontend/src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Kiểm tra xem có token trong localStorage (đã đăng nhập) chưa
  const token = localStorage.getItem('token');

  // Nếu không có token, điều hướng thẳng về trang đăng nhập
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token, cho phép đi tiếp vào các route con (Outlet đại diện cho các route con)
  return <Outlet />;
};

export default ProtectedRoute;