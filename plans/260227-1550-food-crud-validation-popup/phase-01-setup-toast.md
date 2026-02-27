# Phase 1: Setup react-hot-toast

## Overview
- **Priority:** High
- **Status:** pending
- **Effort:** Small

## Context
Cài đặt và cấu hình react-hot-toast cho toàn bộ ứng dụng.

## Requirements
- Cài đặt react-hot-toast
- Thêm Toaster component vào App.tsx
- Cấu hình style phù hợp với design (dark mode)

## Related Files

**Modify:**
- `frontend/package.json`
- `frontend/src/App.tsx`

## Implementation Steps

### Step 1: Install dependency
```bash
cd frontend && npm install react-hot-toast
```

### Step 2: Update App.tsx
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
// ... other imports

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
          },
          success: {
            iconTheme: {
              primary: '#a3e635',
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e293b',
            },
          },
        }}
      />
      <Routes>
        {/* existing routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

## Todo
- [ ] Install react-hot-toast
- [ ] Add Toaster to App.tsx
- [ ] Configure dark mode styles
- [ ] Test toast appears correctly

## Success Criteria
- Toast hiển thị ở góc trên bên phải
- Style phù hợp dark mode
- Auto dismiss sau 3s

## Next Phase
Phase 2: Create ConfirmModal component
