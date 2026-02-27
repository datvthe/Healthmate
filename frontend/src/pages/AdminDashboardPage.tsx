import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const AdminDashboardPage = () => {
  const menuItems = [
    {
      title: 'Quản lý món ăn',
      description: 'Thêm, sửa, xóa món ăn trong thư viện',
      icon: '🍽️',
      links: [
        { label: 'Thêm món ăn mới', path: '/dashboard/foods/new' },
        { label: 'Xem thư viện', path: '/foods' }
      ]
    },
    {
      title: 'Thống kê',
      description: 'Xem báo cáo và thống kê hệ thống',
      icon: '📊',
      links: [
        { label: 'Sắp ra mắt', path: '#' }
      ]
    }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Admin <span className="text-primary">Dashboard</span>
        </h1>
        <p className="text-slate-500 mb-8">Quản lý hệ thống HealthMate</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.title}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h2 className="text-xl font-bold mb-2">{item.title}</h2>
              <p className="text-sm text-slate-500 mb-4">{item.description}</p>
              <div className="space-y-2">
                {item.links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
