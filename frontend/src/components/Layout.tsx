import { type ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

// Khai báo kiểu dữ liệu cho props để TypeScript không báo lỗi
interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    // Thiết lập font chữ, màu nền chung cho toàn bộ website
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      {/* Navbar luôn ở trên cùng */}
      <Navbar />

      {/* Nội dung chính của các trang sẽ thay đổi ở đây */}
      <main className="flex flex-col flex-1 max-w-[1280px] mx-auto w-full px-4 md:px-10 py-8 gap-8">
        {children}
      </main>

      {/* Footer luôn nằm dưới cùng */}
      <Footer />
    </div>
  );
};

export default Layout;