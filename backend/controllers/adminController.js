// Simple admin controller for testing
const getDashboardStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: 12450,
      activeSessions: 843,
      monthlyGrowth: 12,
      uptime: '24d 13h',
      recentActivity: [
        {
          id: '1',
          user: 'Nguyễn Văn A',
          action: 'Hoàn thành workout Push Day',
          timestamp: new Date().toISOString(),
          type: 'workout'
        },
        {
          id: '2',
          user: 'Trần Thị B',
          action: 'Tạo workout mới Cardio HIIT',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          type: 'workout'
        },
        {
          id: '3',
          user: 'Lê Văn C',
          action: 'Cập nhật profile',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'profile'
        },
        {
          id: '4',
          user: 'Phạm Thị D',
          action: 'Đăng nhập hệ thống',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          type: 'login'
        }
      ]
    };
    
    console.log('Dashboard stats sent:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || 'all';
    const status = req.query.status || 'all';
    const skip = (page - 1) * limit;

    // Mock data for testing
    const mockUsers = [
      {
        id: '1',
        email: 'admin@healthmate.com',
        role: 'admin',
        status: 'active',
        profile: {
          full_name: 'System Administrator',
          phone_number: '+849012345678',
          address: 'Hanoi, Vietnam'
        },
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date()
      },
      {
        id: '2',
        email: 'user@example.com',
        role: 'user',
        status: 'active',
        profile: {
          full_name: 'Regular User',
          phone_number: '+849012345679',
          address: 'Ho Chi Minh City, Vietnam'
        },
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        email: 'john.doe@example.com',
        role: 'user',
        status: 'inactive',
        profile: {
          full_name: 'John Doe',
          phone_number: '+849012345680',
          address: 'Da Nang, Vietnam'
        },
        createdAt: new Date('2024-02-01'),
        lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    // Apply filters
    let filteredUsers = mockUsers;
    
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.profile.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    if (status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    const total = filteredUsers.length;
    const users = filteredUsers.slice(skip, skip + limit);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, role, status, profile } = req.body;
    
    // Mock user creation
    const newUser = {
      id: Date.now().toString(),
      email,
      role: role || 'user',
      status: status || 'active',
      profile: {
        full_name: profile.full_name,
        phone_number: profile.phone_number || '',
        address: profile.address || ''
      },
      createdAt: new Date(),
      lastLogin: null
    };

    console.log('User created:', newUser);
    
    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, profile } = req.body;
    
    console.log('User updated:', { id, role, status, profile });
    
    res.json({
      message: 'User updated successfully',
      user: { id, role, status, profile }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('User deleted:', id);
    
    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const getSystemLogs = async (req, res) => {
  try {
    const logs = [
      {
        id: '1',
        level: 'info',
        message: 'User login successful',
        timestamp: new Date(),
        user: 'admin@example.com'
      },
      {
        id: '2',
        level: 'warning',
        message: 'High memory usage detected',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        user: 'System'
      }
    ];
    
    res.json({
      logs,
      pagination: { page: 1, limit: 20, total: 2, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const createBackup = async (req, res) => {
  try {
    const backupData = {
      timestamp: new Date(),
      status: 'completed',
      message: 'Backup created successfully'
    };
    
    console.log('Backup created:', backupData);
    res.json({
      message: 'Backup completed successfully',
      backup: backupData
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const systemRecovery = async (req, res) => {
  try {
    const recoveryData = {
      timestamp: new Date(),
      status: 'completed',
      actions: ['Database reconnected', 'Cache cleared', 'Services restarted']
    };
    
    console.log('System recovery completed:', recoveryData);
    res.json({
      message: 'System recovery completed successfully',
      recovery: recoveryData
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const getSystemPerformance = async (req, res) => {
  try {
    const performance = {
      cpu: { usage: 35, cores: 4, temperature: 45 },
      memory: { usage: 62, total: 8192, available: 4096 },
      disk: { usage: 78, total: 500, available: 150 },
      network: { latency: 24, uptime: '24d 13h', requests: 1250 }
    };
    
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getSystemLogs,
  createBackup,
  systemRecovery,
  getSystemPerformance
};
