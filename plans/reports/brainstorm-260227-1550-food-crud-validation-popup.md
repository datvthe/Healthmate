# Brainstorm Report: Food CRUD Validation & Popup System

**Date:** 2026-02-27
**Branch:** phamha

## Problem Statement

1. Hệ thống thông báo dùng `alert()`, `confirm()`, `prompt()` - không chuyên nghiệp
2. Validation yếu - chỉ check tên không rỗng
3. Thiếu chức năng Edit/Delete món ăn hoàn chỉnh
4. Bypass authentication (chưa có login)

## Requirements

### Functional
- Thay thế alert/confirm/prompt bằng toast popup và modal
- Thêm validation đầy đủ cho CRUD món ăn
- Duplicate check cho tên món ăn
- Edit food trong cùng page với Add
- Delete food từ danh sách FoodCatalogPage
- Áp dụng cho cả Admin pages và MealPlannerPage

### Non-Functional
- UX mượt mà, không block UI
- Dark mode support
- Reusable components
- Minimal dependencies

## Agreed Solution

### 1. Toast Library: react-hot-toast
- Nhẹ (~5KB), API đơn giản
- Tích hợp tốt với Tailwind

### 2. Validation Rules

| Field | Rule | Message |
|-------|------|---------|
| name | Required, unique | "Vui lòng nhập tên" / "Tên đã tồn tại" |
| calories | >= 0, <= 2000 | "Calo phải từ 0-2000" |
| protein | >= 0, <= 100 | "Protein phải từ 0-100g" |
| carbs | >= 0, <= 100 | "Carbs phải từ 0-100g" |
| fat | >= 0, <= 100 | "Fat phải từ 0-100g" |
| quantity | > 0, <= 5000 | "Số gram phải từ 1-5000" |

### 3. Components
- `ConfirmModal` - Reusable confirm dialog
- Edit mode trong `AdminFoodFormPage` (URL param)

### 4. Files to Change
- `frontend/package.json` - Thêm react-hot-toast
- `frontend/src/App.tsx` - Thêm Toaster
- `frontend/src/pages/AdminFoodFormPage.tsx` - Validation + toast + edit
- `frontend/src/pages/FoodCatalogPage.tsx` - Delete + confirm modal
- `frontend/src/pages/MealPlannerPage.tsx` - Toast + validation + confirm
- `frontend/src/components/ConfirmModal.tsx` - New file

## Trade-offs Accepted
- Thêm 1 dependency (react-hot-toast) vs tự build
- Frontend validation + backend validation (double work but necessary)
- Tự build modal để match design

## Risks & Mitigations
1. Duplicate check delay → Debounce, check on blur
2. Backend không sync → Backend phải validate
3. Modal z-index conflict → Portal, high z-index

## Next Steps
Create implementation plan with phases
