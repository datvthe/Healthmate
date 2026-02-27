# Food CRUD Validation & Popup System

```yaml
status: pending
created: 2026-02-27
branch: phamha
phases: 5
priority: high
```

## Overview

Thay thế `alert()`, `confirm()`, `prompt()` bằng toast popup và modal. Thêm validation đầy đủ cho CRUD món ăn. Bypass authentication.

## Context

- Brainstorm: `plans/reports/brainstorm-260227-1550-food-crud-validation-popup.md`
- Stack: React 19 + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Setup react-hot-toast | pending | `phase-01-setup-toast.md` |
| 2 | Create ConfirmModal component | pending | `phase-02-confirm-modal.md` |
| 3 | Update AdminFoodFormPage (Create/Edit/Validation) | pending | `phase-03-admin-food-form.md` |
| 4 | Update FoodCatalogPage (Delete) | pending | `phase-04-food-catalog-delete.md` |
| 5 | Update MealPlannerPage (Toast/Validation/Modal) | pending | `phase-05-meal-planner.md` |

## Key Decisions

1. **react-hot-toast** - Nhẹ, API đơn giản, tích hợp Tailwind
2. **Tự build ConfirmModal** - Match design, dark mode support
3. **Edit trong cùng page Add** - Reuse code, URL param `/dashboard/foods/:id`
4. **Frontend + Backend validation** - Double validation, backend là source of truth

## Success Criteria

- [ ] Không còn `alert()`, `confirm()`, `prompt()` trong code
- [ ] Toast hiển thị cho success/error messages
- [ ] ConfirmModal cho delete actions
- [ ] Validation đầy đủ theo rules đã định
- [ ] Edit food hoạt động với URL param
- [ ] Delete food từ FoodCatalogPage
- [ ] Dark mode hoạt động đúng

## Dependencies

- react-hot-toast ^2.5.x
