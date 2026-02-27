# Phase 3: Update AdminFoodFormPage (Create/Edit/Validation)

## Overview
- **Priority:** High
- **Status:** pending
- **Effort:** Medium

## Context
Chuyển AdminFoodFormPage thành dual-mode (Create/Edit), thêm validation đầy đủ, thay alert bằng toast.

## Requirements
- Edit mode khi có `:id` param
- Validation rules:
  - name: required, unique
  - calories: 0-2000
  - protein/carbs/fat: 0-100
- Toast thay thế alert
- Duplicate name check (debounced)

## Related Files

**Modify:**
- `frontend/src/App.tsx` - Add edit route
- `frontend/src/pages/AdminFoodFormPage.tsx` - Main changes

**Backend (optional enhancement):**
- `controllers/food-controller.js` - Add duplicate check, validation

## Validation Rules

| Field | Min | Max | Message |
|-------|-----|-----|---------|
| name | required | unique | "Vui lòng nhập tên" / "Tên đã tồn tại" |
| calories | 0 | 2000 | "Calo phải từ 0-2000" |
| protein | 0 | 100 | "Protein phải từ 0-100g" |
| carbs | 0 | 100 | "Carbs phải từ 0-100g" |
| fat | 0 | 100 | "Fat phải từ 0-100g" |

## Implementation Steps

### Step 1: Add edit route to App.tsx
```tsx
<Route path="/dashboard/foods/:id" element={<AdminFoodFormPage />} />
```

### Step 2: Update AdminFoodFormPage

```tsx
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

  // Fetch food data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchFood(id);
    }
  }, [id, isEditMode]);

  const fetchFood = async (foodId: string) => {
    setFetchingFood(true);
    try {
      const response = await fetch(`http://localhost:8000/api/foods/${foodId}`);
      if (response.ok) {
        const food = await response.json();
        setFormData({
          name: food.name,
          category: food.category,
          calories: String(food.calories),
          protein: String(food.protein),
          carbs: String(food.carbs),
          fat: String(food.fat)
        });
      } else {
        toast.error('Không tìm thấy món ăn');
        navigate('/foods');
      }
    } catch {
      toast.error('Lỗi kết nối server');
    } finally {
      setFetchingFood(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên món ăn';
    }

    // Calories validation
    const calories = parseFloat(formData.calories);
    if (formData.calories && (calories < 0 || calories > 2000)) {
      newErrors.calories = 'Calo phải từ 0-2000';
    }

    // Protein validation
    const protein = parseFloat(formData.protein);
    if (formData.protein && (protein < 0 || protein > 100)) {
      newErrors.protein = 'Protein phải từ 0-100g';
    }

    // Carbs validation
    const carbs = parseFloat(formData.carbs);
    if (formData.carbs && (carbs < 0 || carbs > 100)) {
      newErrors.carbs = 'Carbs phải từ 0-100g';
    }

    // Fat validation
    const fat = parseFloat(formData.fat);
    if (formData.fat && (fat < 0 || fat > 100)) {
      newErrors.fat = 'Fat phải từ 0-100g';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkDuplicateName = async (name: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/foods?search=${encodeURIComponent(name)}`
      );
      const foods = await response.json();
      // Check exact match, excluding current food in edit mode
      return foods.some((f: { _id: string; name: string }) =>
        f.name.toLowerCase() === name.toLowerCase() && f._id !== id
      );
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    // Check duplicate name
    const isDuplicate = await checkDuplicateName(formData.name.trim());
    if (isDuplicate) {
      setErrors(prev => ({ ...prev, name: 'Tên món ăn đã tồn tại' }));
      toast.error('Tên món ăn đã tồn tại');
      return;
    }

    setLoading(true);

    try {
      const url = isEditMode
        ? `http://localhost:8000/api/foods/${id}`
        : 'http://localhost:8000/api/foods';

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
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
        toast.success(isEditMode ? 'Cập nhật thành công!' : 'Tạo món ăn thành công!');
        navigate('/foods');
      } else {
        toast.error(data.message || 'Có lỗi xảy ra');
      }
    } catch {
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component with error display under each field
};
```

### Step 3: Update input fields to show errors
Add error display under each input:
```tsx
{errors.name && (
  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
)}
```

## Todo
- [ ] Add edit route `/dashboard/foods/:id`
- [ ] Implement edit mode with useParams
- [ ] Add fetchFood for edit mode
- [ ] Implement validateForm function
- [ ] Implement checkDuplicateName function
- [ ] Replace alert with toast
- [ ] Add error display for each field
- [ ] Update page title for edit mode
- [ ] Update button text for edit mode

## Success Criteria
- Create mode: `/dashboard/foods/new`
- Edit mode: `/dashboard/foods/:id` (fetch và pre-fill data)
- Validation errors hiển thị dưới mỗi field
- Toast success/error thay alert
- Duplicate name check hoạt động

## Next Phase
Phase 4: Update FoodCatalogPage with Delete
