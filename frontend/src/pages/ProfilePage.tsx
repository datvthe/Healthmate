import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

interface Profile {
  full_name?: string;
  gender?: 'male' | 'female' | 'other';
  birth_date?: string;
  height_cm?: number;
  weight_kg?: number;
  goal?: 'muscle_gain' | 'fat_loss' | 'maintain';
}

interface UserResponse {
  _id: string;
  email: string;
  role: string;
  profile?: Profile;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Profile['gender'] | ''>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [goal, setGoal] = useState<Profile['goal'] | ''>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:8000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Không thể tải thông tin hồ sơ.');
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }
          return;
        }

        setUser(data);

        setFullName(data.profile?.full_name || '');
        setGender((data.profile?.gender as Profile['gender']) || '');
        setHeight(
          typeof data.profile?.height_cm === 'number'
            ? String(data.profile.height_cm)
            : ''
        );
        setWeight(
          typeof data.profile?.weight_kg === 'number'
            ? String(data.profile.weight_kg)
            : ''
        );
        setGoal((data.profile?.goal as Profile['goal']) || '');
      } catch (err) {
        setError('Có lỗi xảy ra khi kết nối tới server.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      navigate('/login');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('http://localhost:8000/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          profile: {
            full_name: fullName,
            gender: gender || undefined,
            height_cm: height ? Number(height) : undefined,
            weight_kg: weight ? Number(weight) : undefined,
            goal: goal || undefined
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Cập nhật hồ sơ thất bại.');
        return;
      }

      setSuccess('Cập nhật hồ sơ thành công!');

      if (user) {
        const updatedUser: UserResponse = {
          ...user,
          profile: data.profile
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi kết nối tới server.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!token) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Hồ sơ cá nhân</h1>
            <p className="text-sm text-slate-500">
              Cập nhật thông tin cơ bản để HealthMate cá nhân hóa gợi ý tập luyện và dinh dưỡng.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Đăng xuất
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Đang tải thông tin hồ sơ...</p>
        ) : (
          <>
            {error && (
              <div className="mb-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                {success}
              </div>
            )}

            {user && (
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm mb-4">
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Vai trò:</span>{' '}
                  {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" htmlFor="fullName">
                    Họ và tên
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="gender">
                    Giới tính
                  </label>
                  <select
                    id="gender"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Profile['gender'])}
                  >
                    <option value="">Chọn</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="goal">
                    Mục tiêu
                  </label>
                  <select
                    id="goal"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as Profile['goal'])}
                  >
                    <option value="">Chọn</option>
                    <option value="muscle_gain">Tăng cơ</option>
                    <option value="fat_loss">Giảm mỡ</option>
                    <option value="maintain">Duy trì</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="height">
                    Chiều cao (cm)
                  </label>
                  <input
                    id="height"
                    type="number"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="weight">
                    Cân nặng (kg)
                  </label>
                  <input
                    id="weight"
                    type="number"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full md:w-auto h-10 px-6 rounded-lg bg-primary text-slate-900 font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;

