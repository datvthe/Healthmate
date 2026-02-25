import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [goal, setGoal] = useState<'muscle_gain' | 'fat_loss' | 'maintain' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !fullName) {
      setError('Vui lòng nhập đầy đủ email, mật khẩu và họ tên.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
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
        setError(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        return;
      }

      // Lưu token & user nếu backend trả về
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Sau khi đăng ký thành công, chuyển sang trang hồ sơ để user kiểm tra thông tin
      navigate('/profile');
    } catch (err) {
      setError('Có lỗi xảy ra khi kết nối tới server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        <h1 className="text-2xl font-bold mb-2">Đăng ký tài khoản</h1>
        <p className="text-sm text-slate-500 mb-6">
          Tạo tài khoản HealthMate để theo dõi tập luyện, dinh dưỡng và nhận tư vấn từ AI Coach.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" htmlFor="password">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

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
                onChange={(e) => setGender(e.target.value as typeof gender)}
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
                onChange={(e) => setGoal(e.target.value as typeof goal)}
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
            disabled={loading}
            className="w-full h-10 rounded-lg bg-primary text-slate-900 font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary font-semibold">
            Đăng nhập
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default RegisterPage;

