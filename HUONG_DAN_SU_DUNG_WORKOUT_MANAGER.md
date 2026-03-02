# 🏋️ Hướng Dẫn Sử Dụng Workout Manager

## 🎯 Mục Đích
Nhập workout trên web và xem ngay trên dashboard với real-time update!

## 🚀 Cách Sử Dụng

### 1. Truy Cập Workout Manager
```
http://localhost:5173/workouts
```

### 2. Thêm Workout Mới

#### **Bước 1: Chọn Bài Tập**
- Click dropdown "Chọn Bài Tập"
- Chọn workout có sẵn (ví dụ: Push Day, Pull Day, Leg Day)

#### **Bước 2: Nhập Thông Tin**
- **Thời Gian**: Số phút tập (1-300 phút)
- **Calories Đốt**: Số calories đốt được (1-2000 cal)
- **Ghi Chú**: Cảm nhận về buổi tập (tùy chọn)

#### **Bước 3: Lưu Workout**
- Click "💾 Lưu Workout"
- ✅ Thông báo "Workout đã được lưu thành công!"

### 3. Xem Lịch Sử

#### **Phần "Lịch Sử Gần Đây"**
- Hiển thị tất cả workouts đã thêm
- Mỗi workout có:
  - 📝 Tên bài tập và category
  - ⏱️ Thời gian tập
  - 🔥 Calories đốt
  - 📅 Ngày giờ
  - 🗑️ Nút xóa

#### **Xóa Workout**
- Click icon thùng rác 🗑️
- Xác nhận "Bạn có chắc muốn xóa workout này?"

### 4. Thống Kê Nhanh

#### **4 Cards Thống Kê**
- **Workouts**: Tổng số workouts
- **Total Calories**: Tổng calories đốt
- **Total Minutes**: Tổng thời gian tập
- **Avg Calories**: Calories trung bình mỗi workout

### 5. Xem Dashboard

#### **Cách 1: Click Button**
- Click "📊 Xem Dashboard" ở trên cùng

#### **Cách 2: Navigation**
- Click "Dashboard" trong navbar

#### **Data sẽ hiển thị:**
- **Stats Cards**: Calories, Workouts, Weight, Active Time
- **Performance Analytics**: Chart calories theo ngày
- **Today's Activities**: Workout hôm nay
- **Weekly Summary**: Thống kê tuần

## 🔄 Real-time Update

### **Luồng Hoạt Động:**
1. **Thêm workout** trên Workout Manager
2. **Auto-save** vào database
3. **Refresh** dashboard stats
4. **Hiển thị ngay** trên charts

### **Test Flow:**
1. Mở `http://localhost:5173/workouts`
2. Thêm 1-2 workouts
3. Click "📊 Xem Dashboard"
4. **Kết quả**: Data mới hiển thị ngay!

## 🛠️ Kỹ Thuật

### **Frontend:**
- **React Router** điều hướng `/workouts` → `/dashboard`
- **useState** quản lý form data
- **useEffect** fetch data từ API
- **Real-time update** sau khi save

### **Backend:**
- **POST /api/tracker/workouts** lưu workout mới
- **GET /api/tracker/workouts** lấy lịch sử
- **GET /api/tracker/dashboard-stats** thống kê
- **MongoDB** lưu trữ data

### **Data Flow:**
```
WorkoutManager → POST /api/tracker/workouts → MongoDB
Dashboard → GET /api/tracker/dashboard-stats → Charts
```

## 🎨 UI Features

### **Responsive Design:**
- Mobile: 1 column layout
- Tablet: 2 columns
- Desktop: 2 columns với spacing

### **Dark Mode:**
- Tự động theo system preference
- Toggle trong browser settings

### **Material Icons:**
- fitness_center: Workout icon
- delete: Xóa icon
- trending_up: Statistics icon

## 🔧 Troubleshooting

### **Không lưu được workout:**
1. Kiểm tra backend đang chạy (port 8000)
2. Kiểm tra token trong localStorage
3. Kiểm tra network connection

### **Không thấy data trên dashboard:**
1. Refresh dashboard page
2. Kiểm tra API responses trong browser console
3. Verify data trong MongoDB Compass

### **Lỗi 401 Unauthorized:**
1. Login lại
2. Clear localStorage
3. Get token mới

## 📱 Mobile Usage

### **Touch-friendly:**
- Large buttons cho easy tapping
- Swipeable workout list
- Responsive form inputs

### **Performance:**
- Optimized re-renders
- Efficient data fetching
- Smooth transitions

## 🎯 Best Practices

### **Data Entry:**
- Nhập calories thực tế (200-800 per workout)
- Thời gian hợp lý (15-120 phút)
- Ghi chú chi tiết để theo dõi progress

### **Consistency:**
- Log workout sau mỗi buổi tập
- Update weight hàng tuần
- Review dashboard monthly

---

**🎉 Bắt đầu sử dụng ngay:**

1. **Login** vào ứng dụng
2. Truy cập **http://localhost:5173/workouts**
3. **Thêm workout** đầu tiên
4. **Xem dashboard** để thấy kết quả!

**Tất cả data sẽ sync real-time giữa Workout Manager và Dashboard!** 🚀
