# Phase 5: Update MealPlannerPage

## Overview
- **Priority:** High
- **Status:** pending
- **Effort:** Medium

## Context
Thay thế `alert()`, `confirm()`, `prompt()` trong MealPlannerPage bằng toast và modal. Thêm validation cho quantity.

## Requirements
- Toast thay thế alert
- ConfirmModal thay thế confirm
- Input modal thay thế prompt (cho quantity)
- Validation: quantity > 0, <= 5000

## Related Files

**Modify:**
- `frontend/src/pages/MealPlannerPage.tsx`

**Import:**
- `frontend/src/components/confirm-modal.tsx`

## Current Issues in MealPlannerPage

| Line | Current | Replace With |
|------|---------|--------------|
| 71 | `prompt('Nhập số gram:', '100')` | Input modal |
| 91 | `alert(data.message)` | `toast.error()` |
| 99 | `confirm('Bạn có chắc...')` | ConfirmModal |
| 114 | `alert('Số lượng phải lớn hơn 0')` | `toast.error()` + inline validation |
| 257 | `prompt(...)` in modal | Inline input |

## Implementation Steps

### Step 1: Add imports and new state
```tsx
import toast from 'react-hot-toast';
import ConfirmModal from '../components/confirm-modal';

// Add states
const [deleteModal, setDeleteModal] = useState<{
  isOpen: boolean;
  itemId: string;
  itemName: string;
}>({ isOpen: false, itemId: '', itemName: '' });

const [addFoodModal, setAddFoodModal] = useState<{
  isOpen: boolean;
  food: Food | null;
  quantity: string;
}>({ isOpen: false, food: null, quantity: '100' });

const [quantityError, setQuantityError] = useState('');
```

### Step 2: Update handleAddFoodFromUrl
```tsx
const handleAddFoodFromUrl = async (foodId: string) => {
  // Fetch food info first
  try {
    const response = await fetch(`http://localhost:8000/api/foods/${foodId}`);
    if (response.ok) {
      const food = await response.json();
      setAddFoodModal({ isOpen: true, food, quantity: '100' });
    }
  } catch {
    toast.error('Không thể tải thông tin món ăn');
  }
};
```

### Step 3: Create quantity validation
```tsx
const validateQuantity = (value: string): boolean => {
  const qty = parseInt(value);
  if (isNaN(qty) || qty <= 0) {
    setQuantityError('Số gram phải lớn hơn 0');
    return false;
  }
  if (qty > 5000) {
    setQuantityError('Số gram không được quá 5000');
    return false;
  }
  setQuantityError('');
  return true;
};
```

### Step 4: Update addFoodToMealPlan with toast
```tsx
const addFoodToMealPlan = async (foodId: string, quantity: number) => {
  try {
    const response = await fetch(`http://localhost:8000/api/meal-plans/${selectedDate}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ food_id: foodId, quantity })
    });

    if (response.ok) {
      toast.success('Đã thêm món ăn vào thực đơn');
      fetchMealPlan();
      setShowFoodModal(false);
      setAddFoodModal({ isOpen: false, food: null, quantity: '100' });
    } else {
      const data = await response.json();
      toast.error(data.message || 'Lỗi khi thêm món ăn');
    }
  } catch {
    toast.error('Lỗi kết nối server');
  }
};
```

### Step 5: Update removeItem with ConfirmModal
```tsx
const handleDeleteClick = (item: MealItem) => {
  setDeleteModal({
    isOpen: true,
    itemId: item._id,
    itemName: item.name,
  });
};

const handleDeleteConfirm = async () => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/meal-plans/${selectedDate}/items/${deleteModal.itemId}`,
      { method: 'DELETE', credentials: 'include' }
    );
    if (response.ok) {
      toast.success('Đã xóa món ăn');
      fetchMealPlan();
    } else {
      toast.error('Lỗi khi xóa món ăn');
    }
  } catch {
    toast.error('Lỗi kết nối server');
  } finally {
    setDeleteModal({ isOpen: false, itemId: '', itemName: '' });
  }
};
```

### Step 6: Update updateQuantity with validation
```tsx
const updateQuantity = async (itemId: string) => {
  if (editQuantity <= 0) {
    toast.error('Số lượng phải lớn hơn 0');
    return;
  }
  if (editQuantity > 5000) {
    toast.error('Số lượng không được quá 5000g');
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8000/api/meal-plans/${selectedDate}/items/${itemId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity: editQuantity })
      }
    );
    if (response.ok) {
      toast.success('Đã cập nhật số lượng');
      fetchMealPlan();
      setEditingItem(null);
    } else {
      toast.error('Lỗi khi cập nhật');
    }
  } catch {
    toast.error('Lỗi kết nối server');
  }
};
```

### Step 7: Update food selection in modal
Replace prompt with inline input:
```tsx
{foods.map((food) => (
  <div
    key={food._id}
    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
  >
    <div className="flex items-center justify-between mb-2">
      <div>
        <div className="font-medium">{food.name}</div>
        <div className="text-xs text-slate-500">{food.category}</div>
      </div>
      <div className="text-right">
        <div className="font-bold text-primary">{food.calories}</div>
        <div className="text-xs text-slate-500">kcal/100g</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="number"
        placeholder="100"
        min="1"
        max="5000"
        className="flex-1 px-2 py-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const qty = parseInt((e.target as HTMLInputElement).value) || 100;
            if (qty > 0 && qty <= 5000) {
              addFoodToMealPlan(food._id, qty);
            } else {
              toast.error('Số gram phải từ 1-5000');
            }
          }
        }}
      />
      <span className="text-xs text-slate-500">g</span>
      <button
        onClick={(e) => {
          const input = (e.target as HTMLElement).parentElement?.querySelector('input');
          const qty = parseInt(input?.value || '100');
          if (qty > 0 && qty <= 5000) {
            addFoodToMealPlan(food._id, qty);
          } else {
            toast.error('Số gram phải từ 1-5000');
          }
        }}
        className="px-3 py-1 bg-primary text-slate-900 text-sm rounded font-medium hover:bg-primary/90"
      >
        Thêm
      </button>
    </div>
  </div>
))}
```

### Step 8: Add ConfirmModal at end of component
```tsx
<ConfirmModal
  isOpen={deleteModal.isOpen}
  title="Xóa món ăn"
  message={`Bạn có chắc muốn xóa "${deleteModal.itemName}" khỏi thực đơn?`}
  confirmText="Xóa"
  cancelText="Hủy"
  confirmVariant="danger"
  onConfirm={handleDeleteConfirm}
  onCancel={() => setDeleteModal({ isOpen: false, itemId: '', itemName: '' })}
/>
```

## Todo
- [ ] Import toast and ConfirmModal
- [ ] Add deleteModal, addFoodModal states
- [ ] Update handleAddFoodFromUrl
- [ ] Add validateQuantity function
- [ ] Update addFoodToMealPlan with toast
- [ ] Update removeItem to use ConfirmModal
- [ ] Update updateQuantity with validation + toast
- [ ] Replace prompt in food modal with inline input
- [ ] Add ConfirmModal to JSX
- [ ] Test all flows

## Success Criteria
- Không còn `alert()`, `confirm()`, `prompt()` trong code
- Toast hiển thị cho success/error
- ConfirmModal cho delete
- Quantity validation: 1-5000g
- Inline input thay prompt trong food modal

## Final Checklist
- [ ] Test create food flow
- [ ] Test edit food flow
- [ ] Test delete food flow
- [ ] Test add item to meal plan
- [ ] Test edit item quantity
- [ ] Test delete item from meal plan
- [ ] Verify dark mode
- [ ] Verify mobile responsive
