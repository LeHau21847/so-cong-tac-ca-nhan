# Sổ Công Tác Cá Nhân (Personal Work Log & Scheduler)
> **Mobile-First Progressive Web App (PWA)** tối ưu cho điện thoại (chụp ảnh hiện trường nhanh) và máy tính (quản lý, thống kê, xuất báo cáo).
> Hệ thống **100% Miễn Phí & Serverless 0đ** kết nối **Google Drive 5TB** và **Google Sheets**.

---

## 🚀 ĐẶC ĐIỂM NỔI BẬT

### 1. 3 Phân Hệ Nghiệp Vụ Chuyên Biệt
- 🔷 **Đoàn Thanh Niên (`doan_thanh_nien`)**: Màu Xanh Thanh Niên (`#0066FF`), theo dõi các hoạt động phong trào, tình nguyện, sinh hoạt chi đoàn.
- 🔴 **ANTT Cơ Sở (`antt_co_so`)**: Màu Đỏ/Cảnh sát (`#DC2626`), theo dõi ca tuần tra đêm, giải quyết mâu thuẫn cơ sở, tuyên truyền phòng chống tội phạm.
- 🟣 **Các Công Việc Khác (`cong_viec_khac`)**: Màu Tím/Slate (`#7C3AED`), ghi nhận nhiệm vụ chuyên môn, hành chính một cửa, học tập nâng cao nghiệp vụ.

### 2. Chụp Nhanh Hiện Trường (Mobile Priority FAB)
- **Nút Chụp / Ghi việc nổi bật** cố định ở thanh điều hướng dưới cùng.
- Mở trực tiếp Camera sau của điện thoại (`capture="environment"`) hoặc thư viện ảnh.
- **Nén ảnh thông minh Client Canvas API**: Giữ độ nét cao HD/FullHD nhưng giảm dung lượng từ 5MB-10MB xuống **~300KB - 600KB/ảnh**, giúp tải lên qua 4G chỉ mất 1-2 giây.
- **1 Chạm Chọn Mảng**: 3 nút chọn phân hệ trực quan.
- Tự động điền ngày giờ, gợi ý tiêu đề nhanh thông minh.

### 3. Kế Hoạch & Lịch Họp Tiếp Theo (Scheduler & Todo)
- Phân nhóm dòng thời gian: *Hôm nay*, *Ngày mai*, *Tuần này*, *Thời gian tới*, *Cần xác nhận kết quả*.
- Nút bấm **"Hoàn thành & Bổ sung ảnh"**: Chuyển ngay lịch hẹn/họp thành công việc đã hoàn thành, đính kèm ảnh chụp thực tế tại buổi làm việc và chuyển thẳng vào Sổ công tác.

### 4. Báo Cáo & Xét Khen Thưởng Tự Động (Report Generator)
- Bộ lọc đa chiều: Theo Ngày, Tuần, Tháng (1-12), Quý (I-IV), Năm hoặc Khoảng ngày tùy chọn.
- Lọc nhanh **"Việc tiêu biểu / Xét khen thưởng"** (`isHighlighted = true`).
- Xuất văn bản hành chính chuẩn:
  - **Sao chép 1 chạm**: Copy văn bản mẫu (I. Đoàn TN, II. ANTT cơ sở, III. Việc khác, IV. Đề xuất khen thưởng, V. Minh chứng) dán thẳng vào Word/Zalo/Telegram.
  - **Xuất bảng Excel/CSV**: Tải file `.csv` có link ảnh Google Drive.
  - **Chế độ In / Lưu PDF**: Trực quan khổ giấy A4 chuẩn.

### 5. Google Drive 5TB & Google Sheets Serverless (0đ Chi Phí)
- Đi kèm file `google-apps-script/Code.gs` đóng vai trò REST API.
- Tự động tạo thư mục trên Google Drive:
  `So_Cong_Tac_Ca_Nhan` -> `[01_Doan_Thanh_Nien | 02_ANTT_Co_So | 03_Cong_Viec_Khac]` -> `[YYYY-MM]`
- Tự động gán quyền xem qua link và lưu link ảnh trực tiếp vào Google Sheets.
- **Offline-Ready & Optimistic UI**: Mở app là thấy dữ liệu ngay lập tức, lưu cục bộ tức thì rồi đồng bộ ngầm lên đám mây khi có mạng.

---

## 🛠️ HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### Yêu cầu môi trường
- Node.js version 18 trở lên (đã kiểm tra tương thích Node v20/v22/v24).
- Trình duyệt web hiện đại trên Android / iOS (Safari, Chrome, Edge).

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Mở trình duyệt tại địa chỉ hiển thị trên terminal (thường là `http://localhost:5173`).

### 3. Đóng gói cho Production
```bash
npm run build
```
Kết quả build nằm tại thư mục `dist/` cùng Service Worker PWA sẵn sàng hoạt động offline.

---

## 🌐 HƯỚNG DẪN CÀI ĐẶT PWA LÊN ĐIỆN THOẠI (iOS & Android)

### Trên iPhone / iPad (Safari):
1. Mở ứng dụng web trên trình duyệt Safari.
2. Bấm vào nút **Chia sẻ (Share)** hình ô vuông có mũi tên hướng lên.
3. Cuộn xuống và chọn **"Thêm vào Màn hình chính" (Add to Home Screen)**.
4. Nhấn **Thêm (Add)**. Ứng dụng sẽ xuất hiện như một App độc lập với biểu tượng riêng, không còn thanh URL của trình duyệt.

### Trên Android (Chrome / Edge / Cốc Cốc):
1. Mở ứng dụng web trên Google Chrome.
2. Nhấn vào biểu tượng **3 chấm menu** ở góc trên bên phải.
3. Chọn **"Cài đặt ứng dụng" (Install App)** hoặc **"Thêm vào Màn hình chính"**.
4. Ứng dụng sẽ được cài đặt trực tiếp vào ngăn kéo ứng dụng của điện thoại.

---

## ☁️ HƯỚNG DẪN KẾT NỐI GOOGLE APPS SCRIPT (5TB DRIVE)

Xem hướng dẫn chi tiết từng bước có giải thích tại [google-apps-script/README.md](file:///e:/Sổ%20tay%20công%20việc/google-apps-script/README.md).

Tóm tắt nhanh:
1. Tạo một Google Trang tính (Google Sheets) mới trên Google Drive của bạn.
2. Chọn menu **Tiện ích mở rộng (Extensions)** > **Apps Script**.
3. Dán toàn bộ nội dung file `google-apps-script/Code.gs` vào.
4. Bấm **Triển khai (Deploy)** > **Tùy chọn triển khai mới (New deployment)**:
   - Loại: **Ứng dụng web (Web app)**
   - Thực thi dưới dạng: **Tôi (Địa chỉ email của bạn)**
   - Ai có quyền truy cập: **Bất kỳ ai (Anyone)**
5. Nhấn **Triển khai**, ủy quyền truy cập cho script.
6. Sao chép **URL ứng dụng web** (có dạng `https://script.google.com/macros/s/.../exec`).
7. Mở Web App > Bấm biểu tượng **Bánh răng Cài đặt** góc trên bên phải > Dán URL vào ô **URL Google Apps Script Web App** > Bấm **Kiểm tra kết nối**.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```
e:\Sổ tay công việc/
├── dist/                          # Bản build sản phẩm (Vite + PWA)
├── google-apps-script/
│   ├── Code.gs                    # Backend REST API kết nối Google Sheets & Drive
│   └── README.md                  # Hướng dẫn chi tiết triển khai Google Script
├── public/
│   ├── favicon.svg                # Icon SVG chất lượng cao
│   ├── pwa-192x192.png            # Icon PWA 192px
│   ├── pwa-512x512.png            # Icon PWA 512px
│   └── apple-touch-icon.png       # Icon Apple iOS
├── src/
│   ├── components/
│   │   ├── common/                # CategoryBadge, FilterBar, Lightbox, Toast
│   │   ├── dashboard/             # Màn hình Dashboard (KPIs, Recharts)
│   │   ├── gallery/               # Thư viện ảnh minh chứng
│   │   ├── layout/                # Navbar, Sidebar, Mobile BottomNav
│   │   ├── quick-capture/         # Modal Chụp nhanh hiện trường (Mobile Priority)
│   │   ├── reports/               # Bộ tạo báo cáo hành chính & Khen thưởng
│   │   ├── scheduler/             # Lịch công tác & Modal Hoàn thành kèm ảnh
│   │   ├── settings/              # Modal Cài đặt Cloud Google Apps Script
│   │   └── work-log/              # Sổ công tác (Card & Table View)
│   ├── context/
│   │   └── AppContext.tsx         # Quản lý trạng thái toàn cục ứng dụng
│   ├── services/
│   │   ├── mockData.ts            # Dữ liệu mẫu phong phú ban đầu
│   │   └── storage.ts             # Lưu trữ Offline, Cache, Sync Google Script
│   ├── types/
│   │   └── index.ts               # Data schema chuẩn của WorkItem
│   ├── utils/
│   │   ├── constants.ts           # Cấu hình 3 phân hệ, màu sắc, folder Drive
│   │   ├── dateHelpers.ts         # Xử lý Ngày/Tuần/Tháng/Quý/Năm date-fns
│   │   └── imageCompressor.ts     # Nén ảnh Canvas thông minh Client-side
│   ├── App.tsx                    # Component chính kết nối toàn bộ màn hình
│   ├── index.css                  # Tailwind styles & Safe area padding
│   └── main.tsx                   # Điểm khởi chạy React 19
├── tailwind.config.js             # Cấu hình màu sắc nhận diện 3 phân hệ
├── vite.config.ts                 # Cấu hình Vite & PWA auto-update
├── vercel.json                    # Cấu hình triển khai Vercel
└── package.json
```
