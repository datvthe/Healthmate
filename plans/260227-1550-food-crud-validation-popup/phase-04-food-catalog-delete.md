# Phase 4: Update FoodCatalogPage with Delete

## Overview
- **Priority:** High
- **Status:** pending
- **Effort:** Small

## Context
Thêm nút Delete và Edit cho mỗi food card trong FoodCatalogPage. Sử dụng ConfirmModal cho delete confirmation.

## Requirements
- Nút Edit link đến `/dashboard/foods/:id`
- Nút Delete với ConfirmModal
- Toast feedback sau delete
- Loading state khi deleting

## Related Files

**Modify:**
- `frontend/src/pages/FoodCatalogPage.tsx`

**Import:**
- `frontend/src/components/confirm-modal.tsx`

## Implementation Steps

### Step 1: Add imports and state
```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import ConfirmModal from '../components/confirm-modal';

// Add state for delete modal
const [deleteModal, setDeleteModal] = useState<{
  isOpen: boolean;
  foodId: string;
  foodName: string;
}>({ isOpen: false, foodId: '', foodName: '' });
const [deleting, setDeleting] = useState(false);
```

### Step 2: Add delete handler
```tsx
const handleDeleteClick = (food: Food) => {
  setDeleteModal({
    isOpen: true,
    foodId: food._id,
    foodName: food.name,
  });
};

const handleDeleteConfirm = async () => {
  setDeleting(true);
  try {
    const response = await fetch(
      `http://localhost:8000/api/foods/${deleteModal.foodId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (response.ok) {
      toast.success(`Đã xóa "${deleteModal.foodName}"`);
      fetchFoods(); // Refresh list
    } else {
      const data = await response.json();
      toast.error(data.message || 'Lỗi khi xóa món ăn');
    }
  } catch {
    toast.error('Lỗi kết nối server');
  } finally {
    setDeleting(false);
    setDeleteModal({ isOpen: false, foodId: '', foodName: '' });
  }
};

const handleDeleteCancel = () => {
  setDeleteModal({ isOpen: false, foodId: '', foodName: '' });
};
```

### Step 3: Update food card with action buttons
Replace the current "Thêm vào thực đơn" link with action buttons:
```tsx
<div className="mt-4 flex gap-2">
  <Link
    to={`/meal-planner?addFood=${food._id}`}
    className="flex-1 text-center py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition"
  >
    Thêm vào thực đơn
  </Link>
  <Link
    to={`/dashboard/foods/${food._id}`}
    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
    title="Sửa"
  >
    ✎
  </Link>
  <button
    onClick={() => handleDeleteClick(food)}
    className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition"
    title="Xóa"
  >
    ✕
  </button>
</div>
```

### Step 4: Add ConfirmModal at bottom of component
```tsx
<ConfirmModal
  isOpen={deleteModal.isOpen}
  title="Xóa món ăn"
  message={`Bạn có chắc muốn xóa "${deleteModal.foodName}"? Hành động này không thể hoàn tác.`}
  confirmText={deleting ? 'Đang xóa...' : 'Xóa'}
  cancelText="Hủy"
  confirmVariant="danger"
  onConfirm={handleDeleteConfirm}
  onCancel={handleDeleteCancel}
/>
```

## Todo
- [ ] Import toast and ConfirmModal
- [ ] Add deleteModal state
- [ ] Add handleDeleteClick function
- [ ] Add handleDeleteConfirm function
- [ ] Add handleDeleteCancel function
- [ ] Update food card with Edit/Delete buttons
- [ ] Add ConfirmModal to JSX
- [ ] Test delete flow

## Success Criteria
- Edit button navigates to `/dashboard/foods/:id`
- Delete button opens ConfirmModal
- Confirm delete calls API and shows toast
- Cancel closes modal
- List refreshes after successful delete

## Next Phase
Phase 5: Update MealPlannerPage
