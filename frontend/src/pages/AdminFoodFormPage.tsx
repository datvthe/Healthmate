import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';

const CATEGORIES = ['Tinh bột', 'Đạm', 'Rau củ', 'Trái cây', 'Đồ uống', 'Khác'];
const MAX_IMAGE_SIZE = 600; // px mỗi chiều tối đa
const IMAGE_QUALITY = 0.8;

interface FormErrors {
  name?: string;
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
}

// Resize ảnh client-side bằng Canvas API trước khi upload
const resizeImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_SIZE) / width);
          width = MAX_IMAGE_SIZE;
        } else {
          width = Math.round((width * MAX_IMAGE_SIZE) / height);
          height = MAX_IMAGE_SIZE;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Không thể xử lý ảnh'))),
        'image/jpeg',
        IMAGE_QUALITY
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Không thể đọc ảnh')); };
    img.src = url;
  });
};

const AdminFoodFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // State quản lý ảnh
  const [imageFile, setImageFile] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // URL preview hiện tại (blob: hoặc http:)
  const [removeImage, setRemoveImage] = useState(false); // Đánh dấu xóa ảnh cũ

  useEffect(() => {
    if (isEditMode && id) {
      fetchFood(id);
    }
  }, [id]);

  // Dọn dẹp object URL khi unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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
        if (data.image) {
          setImagePreview(`http://localhost:8000${data.image}`);
        }
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const resized = await resizeImage(file);
      // Xóa preview cũ nếu là blob URL
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(resized);
      setImagePreview(URL.createObjectURL(resized));
      setRemoveImage(false);
    } catch {
      toast.error('Không thể xử lý ảnh, vui lòng thử lại');
    }
    // Reset input để có thể chọn lại cùng file
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên món ăn';
    } else {
      try {
        const res = await fetch(
          `http://localhost:8000/api/foods?search=${encodeURIComponent(formData.name.trim())}`,
          { credentials: 'include' }
        );
        const data = await res.json();
        const duplicate = Array.isArray(data)
          ? data.find((f: { _id?: string; id?: number | string; name?: string }) =>
              f.name?.toLowerCase() === formData.name.trim().toLowerCase() &&
              (!isEditMode || (String(f._id || f.id) !== id))
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
      // Dùng FormData để gửi cả text fields lẫn file
      const body = new FormData();
      body.append('name', formData.name.trim());
      body.append('category', formData.category);
      body.append('calories', String(parseFloat(formData.calories) || 0));
      body.append('protein', String(parseFloat(formData.protein) || 0));
      body.append('carbs', String(parseFloat(formData.carbs) || 0));
      body.append('fat', String(parseFloat(formData.fat) || 0));
      if (imageFile) {
        body.append('image', imageFile, 'food.jpg');
      } else if (removeImage) {
        body.append('removeImage', 'true');
      }

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body // Không set Content-Type, browser tự set multipart boundary
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

            {/* Section upload ảnh */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Ảnh món ăn
              </label>
              <div className="flex items-start gap-4">
                {/* Preview hoặc placeholder */}
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    {imagePreview ? 'Thay ảnh' : 'Chọn ảnh'}
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-4 py-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition"
                    >
                      Xóa ảnh
                    </button>
                  )}
                  <p className="text-xs text-slate-400">JPG, PNG, WEBP. Tối đa 5MB.</p>
                </div>
              </div>
              {/* Input file ẩn */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

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
