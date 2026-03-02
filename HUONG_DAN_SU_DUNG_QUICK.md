# 🚀 Hướng Dẫn Sử Dụng Workout Manager

## 🎯 Mục Đích
Tạo workout mới và log workout trực tiếp trên web interface!

## 📱 Cách Sử Dụng

### 1. Truy Cập
```
http://localhost:5173/workouts
```

### 2. Tạo Workout Mới

#### **Bước 1: Chọn Chế Độ**
- Click button **"➕ Tạo Workout"** (màu xanh)
- Form tạo workout mới sẽ hiện ra

#### **Bước 2: Điền Thông Tin**
- **Tên Workout**: Push Day, Pull Day, etc.
- **Category**: Strength, Cardio, Flexibility, Recovery, Combat
- **Mô Tả**: Chi tiết về bài tập
- **Độ Khó**: Beginner, Intermediate, Advanced
- **Thời Gian Mặc Định**: Thời gian gợi ý (phút)
- **Calories Mặc Định**: Calories gợi ý

#### **Bước 3: Lưu Workout**
- Click **"🏋️ Tạo Workout Mới"**
- ✅ Workout được lưu vào database
- 🔄 Form reset và dropdown sẽ có workout mới

### 3. Log Workout (Sử Dụng Workout Đã Tạo)

#### **Bước 1: Chuyển Chế Độ**
- Click button **"📋 Log Workout"** (màu xám)
- Form log workout sẽ hiện ra

#### **Bước 2: Chọn Workout**
- Dropdown **"Chọn Bài Tập"** sẽ có đầy đủ workouts
- Chọn workout vừa tạo

#### **Bước 3: Nhập Thông Tin Session**
- **Thời Gian**: Thời gian tập thực tế (phút)
- **Calories Đốt**: Calories đốt thực tế
- **Ghi Chú**: Cảm nhận về buổi tập

#### **Bước 4: Lưu Log**
- Click **"💾 Lưu Workout"**
- ✅ Workout log được lưu
- 🔄 Lịch sử và dashboard sẽ update

## 🔄 Real-time Update Flow

```
Tạo Workout → Log Workout → Dashboard Update
     ↓              ↓              ↓
  Database    →   Database   →   Charts
```

## 🎨 Giao Diện

### **Toggle Button:**
- **"➕ Tạo Workout"** = Chế độ tạo workout mới
- **"📋 Log Workout"** = Chế độ log workout

### **Form Tạo Workout:**
- Background xanh nhạt
- 6 fields: tên, category, mô tả, độ khó, thời gian, calories
- Button xanh đậm "🏋️ Tạo Workout Mới"

### **Form Log Workout:**
- Background trắng
- 4 fields: chọn workout, thời gian, calories, ghi chú
- Button xanh primary "💾 Lưu Workout"

## 🛠️ Test Nhanh

### **Test 1: Tạo 3 Workouts**
1. Click "➕ Tạo Workout"
2. Tạo: "Push Day", "Pull Day", "Leg Day"
3. Click "📋 Log Workout"
4. Kiểm tra dropdown có 3 workouts không

### **Test 2: Log Workout**
1. Chọn "Push Day" từ dropdown
2. Nhập: 45 phút, 350 calories
3. Click "💾 Lưu Workout"
4. Click "📊 Xem Dashboard"
5. Kiểm tra stats cards và charts

## 📊 Kết Quả Trên Dashboard

### **Stats Cards:**
- **Calories Burned**: Tổng calories tuần
- **Workouts**: Tổng số workouts
- **Current Weight**: Cân nặng hiện tại
- **Active Time**: Tổng thời gian tập

### **Performance Analytics:**
- **Chart**: Bar chart calories theo ngày
- **Switching**: Weight/Calories/Muscle buttons
- **Data**: Real-time từ workout logs

### **Today's Activities:**
- **List**: Workouts hôm nay
- **Details**: Tên, category, duration, calories
- **Empty State**: Hiển thị khi chưa có workout

## 🔧 Troubleshooting

### **Dropdown Trống:**
1. Click "➕ Tạo Workout"
2. Tạo ít nhất 1 workout
3. Click "📋 Log Workout"
4. Dropdown sẽ có data

### **Lưu Không Thành Công:**
1. Kiểm tra backend đang chạy (port 8000)
2. Kiểm tra token trong localStorage
3. Kiểm tra network connection

### **Dashboard Không Update:**
1. Refresh dashboard page
2. Kiểm tra API responses trong console
3. Verify data trong MongoDB

## 🎯 Best Practices

### **Tạo Workout:**
- Đặt tên rõ ràng: "Push Day", "Cardio HIIT"
- Chọn category phù hợp
- Đặt calories/time hợp lý
- Thêm mô tả chi tiết

### **Log Workout:**
- Log ngay sau mỗi buổi tập
- Nhập thời gian và calories thực tế
- Ghi chú về cảm nhận
- Consistent logging

---

## 🚀 Bắt Đầu Ngay!

### **Quick Start:**
1. **Login**: `http://localhost:5173/login`
2. **Workout Manager**: `http://localhost:5173/workouts`
3. **Tạo Workout**: Click "➕ Tạo Workout" → Điền form → Lưu
4. **Log Workout**: Click "📋 Log Workout" → Chọn → Log session
5. **Xem Dashboard**: Click "📊 Xem Dashboard" → Thấy kết quả!

**🎉 Bây giờ bạn có thể tạo và log workouts trực tiếp trên web!**

**Tất cả data sẽ sync real-time giữa tạo workout và dashboard!** ⚡
