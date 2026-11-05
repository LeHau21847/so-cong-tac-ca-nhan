# HƯỚNG DẪN KẾT NỐI GOOGLE APPS SCRIPT VỚI SỔ CÔNG TÁC CÁ NHÂN
> Giải pháp Cloud Serverless 0 đồng hoàn hảo: Lưu trữ dữ liệu trên **Google Sheets** và hình ảnh chất lượng cao trên **Google Drive (dung lượng 5TB)**.

---

## 🎯 CÁC BƯỚC TRIỂN KHAI NHANH (MẤT KHOẢNG 2 PHÚT)

### Bước 1: Mở Google Drive cá nhân
1. Truy cập [Google Drive](https://drive.google.com).
2. Tạo một **Google Trang tính mới (Google Sheets)** hoặc truy cập [script.google.com](https://script.google.com).
3. Đặt tên trang tính là `Sổ Công Tác Cá Nhân - Database`.

---

### Bước 2: Mở Trình chỉnh sửa Apps Script
1. Trên thanh menu của Google Sheets, chọn: **Tiện ích mở rộng (Extensions)** > **Apps Script**.
2. Một tab mới sẽ mở ra trình soạn thảo mã nguồn Google Apps Script.
3. Đặt tên dự án ở góc trên bên trái: `So_Cong_Tac_API`.

---

### Bước 3: Dán mã nguồn `Code.gs`
1. Xóa toàn bộ nội dung mẫu đang có trong tệp `Mã.gs` hoặc `Code.gs`.
2. Mở tệp `google-apps-script/Code.gs` trong dự án này, copy toàn bộ nội dung và dán vào Apps Script.
3. Nhấn biểu tượng **Lưu (Save / Ctrl + S)**.

---

### Bước 4: Triển khai thành Web App (Deploy as Web App)
1. Ở góc trên bên phải, nhấn nút **Triển khai (Deploy)** > Chọn **Tùy chọn triển khai mới... (New deployment)**.
2. Nhấn vào biểu tượng bánh răng **Chọn loại (Select type)** > Chọn **Ứng dụng web (Web app)**.
3. Điền các thông số:
   - **Mô tả (Description):** `Phiên bản 1.0 - Sổ Công Tác`
   - **Thực thi dưới dạng (Execute as):** **Tôi (Địa chỉ email của bạn)** *(Rất quan trọng để lưu được ảnh vào Drive của bạn)*
   - **Ai có quyền truy cập (Who has access):** **Bất kỳ ai (Anyone)** *(Quan trọng để ứng dụng PWA có thể gửi ảnh và dữ liệu mà không bị chặn xác thực)*
4. Nhấn nút **Triển khai (Deploy)**.

---

### Bước 5: Cấp quyền truy cập (Chỉ làm 1 lần đầu)
1. Google sẽ hiển thị popup yêu cầu ủy quyền: Nhấn **Ủy quyền truy cập (Authorize access)**.
2. Chọn tài khoản Google của bạn.
3. Nếu thấy cảnh báo *"Google chưa xác minh ứng dụng này" (Google hasn't verified this app)*:
   - Nhấn vào chữ **Nâng cao (Advanced)** ở góc dưới.
   - Nhấn vào **Đi tới So_Cong_Tac_API (không an toàn) / Go to So_Cong_Tac_API (unsafe)**.
   - Nhấn **Cho phép (Allow)**.

---

### Bước 6: Lấy URL Web App dán vào ứng dụng Web
1. Sau khi cấp quyền xong, Google sẽ hiển thị:
   - **URL của ứng dụng web (Web app URL)** (Có dạng: `https://script.google.com/macros/s/AKfycbx.../exec`).
2. Nhấn nút **Sao chép (Copy)** URL này.
3. Mở ứng dụng **Sổ Công Tác Cá Nhân** > Bấm vào biểu tượng **Cài đặt (Bánh răng)** ở góc trên bên phải > Dán URL vừa sao chép vào ô **"URL Google Apps Script Web App"** > Nhấn **"Kiểm tra & Lưu kết nối"**.
4. Ứng dụng sẽ hiển thị thông báo **"Kết nối Google Apps Script thành công!"** và tự động đồng bộ hóa!

---

## 📂 CẤU TRÚC TỰ ĐỘNG TRÊN GOOGLE DRIVE
Khi bạn chụp ảnh và bấm lưu trên web, hệ thống sẽ tự động tạo thư mục và phân loại ảnh như sau:
```
Google Drive của bạn
└── So_Cong_Tac_Ca_Nhan/
    ├── So_Cong_Tac_Database (File Google Sheets lưu dữ liệu)
    ├── 01_Doan_Thanh_Nien/
    │   └── 2026-11/
    │       ├── image_xxxx.jpg
    ├── 02_ANTT_Co_So/
    │   └── 2026-11/
    │       ├── image_yyyy.jpg
    └── 03_Cong_Viec_Khac/
        └── 2026-11/
            ├── image_zzzz.jpg
```
Mỗi ảnh đều được thiết lập quyền xem công khai qua link (`https://lh3.googleusercontent.com/d/[id]`), giúp app tải ảnh cực nhanh và không bao giờ bị mất dữ liệu.

