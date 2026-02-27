import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';

const CATEGORIES = ['Tinh bột', 'Đạm', 'Rau củ', 'Trái cây', 'Đồ uống', 'Khác'];

interface FormErrors {
  name?: string;
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
}

const AdminFoodFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetchingFood, setFetchingFood] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tinh bột',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchFood(id);
    }
  }, [id]);

  const fetchFood = async (foodId: string) => {
    setFetchingFood(true);
    try {
      const response = await fetch(`http://localhost:8000/api/foods/${foodId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setFormData({
          name: data.name || '',
          category: data.category || 'Tinh bột',
          calories: data.calories != null ? String(data.calories) : '',
          protein: data.protein != null ? String(data.protein) : '',
          carbs: data.carbs != null ? String(data.carbs) : '',
          fat: data.fat != null ? String(data.fat) : ''
        });
      } else {
        toast.error(data.message || 'Không tìm thấy món ăn');
        navigate('/foods');
      }
    } catch {
      toast.error('Lỗi kết nối server');
      navigate('/foods');
    } finally {
      setFetchingFood(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên món ăn';
    } else {
      try {
        const res = await fetch(
          `http://localhost:8000/api/foods?name=${encodeURIComponent(formData.name.trim())}`,
          { credentials: 'include' }
        );
        const data = await res.json();
        const duplicate = Array.isArray(data)
          ? data.find((f: { id?: number | string; name?: string }) =>
              f.name?.toLowerCase() === formData.name.trim().toLowerCase() &&
              (!isEditMode || String(f.id) !== id)
            )
          : null;
        if (duplicate) {
          newErrors.name = 'Tên món ăn đã tồn tại';
        }
      } catch {
        // skip duplicate check on network error
      }
    }

    if (formData.calories !== '') {
      const cal = parseFloat(formData.calories);
      if (isNaN(cal) || cal < 0 || cal > 2000) {
        newErrors.calories = 'Calo phải từ 0 đến 2000';
      }
    }

    if (formData.protein !== '') {
      const val = parseFloat(formData.protein);
      if (isNaN(val) || val < 0 || val > 100) {
        newErrors.protein = 'Protein phải từ 0 đến 100';
      }
    }

    if (formData.carbs !== '') {
      const val = parseFloat(formData.carbs);
      if (isNaN(val) || val < 0 || val > 100) {
        newErrors.carbs = 'Carbs phải từ 0 đến 100';
      }
    }

    if (formData.fat !== '') {
      const val = parseFloat(formData.fat);
      if (isNaN(val) || val < 0 || val > 100) {
        newErrors.fat = 'Fat phải từ 0 đến 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) return;

    setLoading(true);

    const url = isEditMode
      ? `http://localhost:8000/api/foods/${id}`
      : 'http://localhost:8000/api/foods';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          category: formData.category,
          calories: parseFloat(formData.calories) || 0,
          protein: parseFloat(formData.protein) || 0,
          carbs: parseFloat(formData.carbs) || 0,
          fat: parseFloat(formData.fat) || 0
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isEditMode ? 'Cập nhật món ăn thành công!' : 'Tạo món ăn thành công!');
        navigate('/foods');
      } else {
        toast.error(data.message || (isEditMode ? 'Lỗi khi cập nhật món ăn' : 'Lỗi khi tạo món ăn'));
      }
    } catch {
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingFood) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto text-center py-12 text-slate-500">
          Đang tải dữ liệu...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {isEditMode ? (
            <>Chỉnh sửa <span className="text-primary">món ăn</span></>
          ) : (
            <>Thêm <span className="text-primary">món ăn mới</span></>
          )}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Tên món ăn *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Cơm trắng"
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Danh mục *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-medium mb-4">Thông tin dinh dưỡng (per 100g)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Calo (kcal)</label>
                  <input
                    type="number"
                    name="calories"
                    value={formData.calories}
                    onChange={handleChange}
                    min="0"
                    max="2000"
                    step="0.1"
                    placeholder="0"
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.calories && (
                    <p className="text-red-500 text-xs mt-1">{errors.calories}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    name="protein"
                    value={formData.protein}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0"
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.protein && (
                    <p className="text-red-500 text-xs mt-1">{errors.protein}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    name="carbs"
                    value={formData.carbs}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0"
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.carbs && (
                    <p className="text-red-500 text-xs mt-1">{errors.carbs}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    name="fat"
                    value={formData.fat}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0"
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.fat && (
                    <p className="text-red-500 text-xs mt-1">{errors.fat}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/foods')}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary text-slate-900 rounded-xl font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading
                ? (isEditMode ? 'Đang cập nhật...' : 'Đang tạo...')
                : (isEditMode ? 'Cập nhật món ăn' : 'Tạo món ăn')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AdminFoodFormPage;
