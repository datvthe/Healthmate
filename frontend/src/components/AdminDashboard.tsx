import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin-dashboard.css';

// Add Material Icons font
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

interface DashboardStats {
  totalUsers: number;
  activeSessions: number;
  monthlyGrowth: number;
  systemHealth: 'good' | 'warning' | 'critical';
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    timestamp: string;
    type: 'login' | 'workout' | 'profile' | 'system';
  }>;
  uptime: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 12450,
    activeSessions: 843,
    monthlyGrowth: 12,
    systemHealth: 'good',
    uptime: '24d 13h',
    recentActivity: [
      {
        id: '1',
        user: 'Nguyễn Văn A',
        action: 'Hoàn thành workout Push Day',
        timestamp: '2024-03-15T10:30:00Z',
        type: 'workout'
      },
      {
        id: '2',
        user: 'Trần Thị B',
        action: 'Tạo workout mới Cardio HIIT',
        timestamp: '2024-03-15T09:45:00Z',
        type: 'workout'
      },
      {
        id: '3',
        user: 'Lê Văn C',
        action: 'Cập nhật profile',
        timestamp: '2024-03-15T09:15:00Z',
        type: 'profile'
      },
      {
        id: '4',
        user: 'Phạm Thị D',
        action: 'Đăng nhập hệ thống',
        timestamp: '2024-03-15T08:30:00Z',
        type: 'login'
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [activeNav, setActiveNav] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      const response = await fetch('http://localhost:8000/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDataBackup = () => {
    // Implement data backup functionality
    console.log('Starting data backup...');
  };

  const handleSystemRecovery = () => {
    // Implement system recovery functionality
    console.log('Starting system recovery...');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { id: 'users', label: 'Users', icon: 'group', route: '/admin/users' },
    { id: 'workouts', label: 'Workouts', icon: 'fitness_center', route: '/admin/workouts' },
    { id: 'logs', label: 'System Logs', icon: 'description', route: '/admin/logs' },
    { id: 'settings', label: 'Settings', icon: 'settings', route: '/admin/settings' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return 'login';
      case 'workout': return 'fitness_center';
      case 'profile': return 'person';
      case 'system': return 'settings';
      default: return 'info';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login': return 'text-blue-400';
      case 'workout': return 'text-green-400';
      case 'profile': return 'text-purple-400';
      case 'system': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="admin-dashboard dark flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-text-light font-display antialiased selection:bg-primary selection:text-background-dark">
      {/* Sidebar Navigation */}
      <aside className="flex w-64 flex-col justify-between border-r border-[#28392e] bg-surface-darker p-4 flex-shrink-0 z-20 overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-center mb-4">
            <div className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 border-2 border-primary/20" 
                 style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDi_ORhEtYDtre8G6YrAKTVxAV6-jnyFq6dRJxWxU8jfJRohQlcHzuS7gxoSzox9O2zJOZYV9J7gP3pjjAj3dXYZy7nZULA6ugWSNwdVCRCi80g0t_PLt0zu8TW08ADGQhcuSFJgAtl1j9CRfZabbO0bm50sVSBML8cagvhtInZU3Km_rIL5AswM-pMt1Ial3BqjEbqHPI2TAw6Fc9vy52WoZSbjML6wyLQiMRA_vhszcd-m-hCBXUVONsUNCJGz1o0nSlXJPmWCes")' }}>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-base font-bold leading-normal">HealthMate Admin</h1>
              <p className="text-text-dim text-xs font-normal leading-normal">System Manager</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeNav === item.id
                    ? 'bg-primary/20 border border-primary/10 text-primary'
                    : 'text-text-dim hover:bg-[#28392e] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <p className="text-sm font-medium leading-normal">{item.label}</p>
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto pt-6 border-t border-[#28392e]">
          <div className="p-4 bg-gradient-to-br from-primary/10 to-transparent rounded-xl border border-primary/10">
            <p className="text-xs text-text-dim font-medium uppercase tracking-wider mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="text-sm text-white font-semibold">All Systems Go</span>
            </div>
            <p className="text-xs text-text-dim mt-2">Server uptime: {stats.uptime}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-[#28392e] bg-background-dark shrink-0">
          <div>
            <h2 className="text-white text-3xl font-bold tracking-tight">System Overview</h2>
            <p className="text-text-dim text-sm mt-1">Real-time analytics and system health monitoring.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleDataBackup}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#28392e] hover:bg-[#344b3c] text-white text-sm font-medium transition-colors border border-transparent hover:border-primary/30"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_download</span>
              Data Backup
            </button>
            <button 
              onClick={handleSystemRecovery}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-background-dark text-sm font-bold transition-colors shadow-[0_0_15px_rgba(19,236,91,0.3)]"
            >
              <span className="material-symbols-outlined text-[18px]">build_circle</span>
              System Recovery
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div className="flex flex-col justify-between p-5 rounded-xl bg-surface-dark border border-[#28392e] hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-start">
                  <p className="text-text-dim text-sm font-medium">Total Users</p>
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">group_add</span>
                </div>
                <div className="mt-4">
                  <p className="text-white text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
                    <p className="text-primary text-sm font-medium">+{stats.monthlyGrowth}%</p>
                    <p className="text-text-dim text-xs ml-1">from last month</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between p-5 rounded-xl bg-surface-dark border border-[#28392e] hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-start">
                  <p className="text-text-dim text-sm font-medium">Active Sessions</p>
                  <span className="material-symbols-outlined text-blue-400 bg-blue-400/10 p-1.5 rounded-lg">devices</span>
                </div>
                <div className="mt-4">
                  <p className="text-white text-3xl font-bold">{stats.activeSessions.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
                    <p className="text-primary text-sm font-medium">+5%</p>
                    <p className="text-text-dim text-xs ml-1">current load</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Line Chart */}
              <div className="lg:col-span-2 p-6 rounded-xl bg-surface-dark border border-[#28392e]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-white text-lg font-bold">New Users by Month</h3>
                    <p className="text-text-dim text-sm">Growth trajectory over last 6 months</p>
                  </div>
                  <div className="flex items-center gap-2 bg-[#112218] rounded-lg p-1 border border-[#28392e]">
                    <button 
                      onClick={() => setSelectedPeriod('month')}
                      className={`px-3 py-1 rounded text-xs font-medium ${selectedPeriod === 'month' ? 'bg-[#28392e] text-white' : 'text-text-dim hover:text-white'}`}
                    >
                      Month
                    </button>
                    <button 
                      onClick={() => setSelectedPeriod('week')}
                      className={`px-3 py-1 rounded text-xs font-medium ${selectedPeriod === 'week' ? 'bg-[#28392e] text-white' : 'text-text-dim hover:text-white'}`}
                    >
                      Week
                    </button>
                    <button 
                      onClick={() => setSelectedPeriod('day')}
                      className={`px-3 py-1 rounded text-xs font-medium ${selectedPeriod === 'day' ? 'bg-[#28392e] text-white' : 'text-text-dim hover:text-white'}`}
                    >
                      Day
                    </button>
                  </div>
                </div>
                <div className="h-64 bg-[#112218] rounded-lg flex items-center justify-center">
                  {loading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  ) : (
                    <div className="text-center">
                      <span className="material-symbols-outlined text-4xl text-primary mb-2">trending_up</span>
                      <p className="text-text-dim">User Growth Chart</p>
                      <p className="text-xs text-text-dim mt-1">+{stats.monthlyGrowth}% average growth</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="p-6 rounded-xl bg-surface-dark border border-[#28392e]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-white text-lg font-bold">Recent Activity</h3>
                    <p className="text-text-dim text-sm">Latest system events</p>
                  </div>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#28392e] transition-colors">
                      <span className={`material-symbols-outlined ${getActivityColor(activity.type)} bg-current/10 p-1.5 rounded-lg`}>
                        {getActivityIcon(activity.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{activity.user}</p>
                        <p className="text-text-dim text-xs">{activity.action}</p>
                        <p className="text-text-dim text-xs mt-1">
                          {new Date(activity.timestamp).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-xl bg-surface-dark border border-[#28392e]">
              <h3 className="text-white text-lg font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#28392e] hover:bg-[#344b3c] transition-colors border border-transparent hover:border-primary/30">
                  <span className="material-symbols-outlined text-primary mb-2">person_add</span>
                  <span className="text-white text-xs font-medium">Add User</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#28392e] hover:bg-[#344b3c] transition-colors border border-transparent hover:border-primary/30">
                  <span className="material-symbols-outlined text-blue-400 mb-2">assessment</span>
                  <span className="text-white text-xs font-medium">Reports</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#28392e] hover:bg-[#344b3c] transition-colors border border-transparent hover:border-primary/30">
                  <span className="material-symbols-outlined text-yellow-400 mb-2">settings</span>
                  <span className="text-white text-xs font-medium">Settings</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#28392e] hover:bg-[#344b3c] transition-colors border border-transparent hover:border-primary/30"
                >
                  <span className="material-symbols-outlined text-red-400 mb-2">logout</span>
                  <span className="text-white text-xs font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
