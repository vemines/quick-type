# ⚡ Quick Type - Smart Text Expander

<p align="center">
  <img src="public/favicon.ico" alt="Quick Type Logo" width="80" height="80" />
</p>

<p align="center">
  <b>Phần mềm gõ tắt và thay thế văn bản thông minh, siêu nhẹ, hiện đại dành cho Windows.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2-blue?logo=tauri" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/Rust-2021-orange?logo=rust" alt="Rust" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6-purple?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Platform-Windows-0078D6?logo=windows" alt="Windows" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

---

## 🌟 Tính năng nổi bật

- 🚀 **Gõ tắt siêu nhanh**:
  - **Chế độ phím kích hoạt (Hotkey Mode)**: Nhấn phím kích hoạt (mặc định phím \`\`\` ) sau khi gõ từ tắt để mở rộng.
  - **Tự động gõ nhanh (Auto Replace)**: Tự động nhận diện và thay thế ngay lập tức khi gõ xong từ tắt hoặc gõ phím cách/dấu câu, không cần bấm thêm phím kích hoạt.
- 📁 **Quản lý đa môi trường (Environments)**:
  - Phân chia nhóm từ tắt theo môi trường: *Công việc, Học tập, Lập trình, Chăm sóc khách hàng...*
  - Ngăn ngừa và cảnh báo trùng lặp từ tắt thông minh.
- 🗂️ **Tích hợp System Tray tiện dụng**:
  - Chạy ẩn mượt mà dưới khay hệ thống, thu nhỏ/ẩn cửa sổ khi đóng.
  - Menu chuột phải có **Submenu chuyển đổi nhanh môi trường** (hiển thị dấu tick môi trường đang kích hoạt, đồng bộ 2 chiều với giao diện).
  - Tạm dừng / Tiếp tục gõ tắt trực tiếp từ tray.
  - Tự động phục hồi icon tray khi Windows Explorer khởi động lại.
- 🕒 **Placeholder động & Mẫu lồng nhau**:
  - Hỗ trợ biến động: `{{date}}`, `{{time}}`, `{{datetime}}`.
  - Hỗ trợ lồng từ tắt trong từ tắt (nested snippets) lên tới 5 tầng.
- 📥 **Nhập / Xuất dữ liệu linh hoạt**:
  - Sao lưu và phục hồi cấu hình đầy đủ dạng file JSON.
  - Hỗ trợ nhập danh sách từ tắt có sẵn từ file text của **UniKey**.
- 🛡️ **Tùy chọn bản build Admin / Thường**:
  - Bản thường: Chạy với quyền người dùng tiêu chuẩn, không hiện popup UAC.
  - Bản Administrator: Tích hợp manifest chạy quyền Admin để gõ tắt trên mọi cửa sổ hệ thống (Terminal, phần mềm kế toán, VS Code Run as Admin...).

---

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend / Core**: Rust, Tauri v2.
- **Windows System API**: Low-level Keyboard Hook (`WH_KEYBOARD_LL`), Win32 Clipboard API, Taskbar Created Message Listener.

---

## 💻 Hướng dẫn cài đặt & Chạy mã nguồn

### Yêu cầu môi trường
- [Node.js](https://nodejs.org/) (khuyến nghị phiên bản 18+ hoặc LTS).
- [Rust & Cargo](https://www.rust-lang.org/tools/install) (khuyến nghị 1.77.2+).
- Cài đặt Visual Studio C++ Build Tools (cho môi trường Windows).

### Cài đặt dependencies
```bash
npm install
```

### Chạy chế độ phát triển (Development)
```bash
npm run tauri:dev
```

---

## 📦 Hướng dẫn đóng gói (Build EXE)

Dự án hỗ trợ 2 chế độ đóng gói trực tiếp ra file `.exe` độc lập (nằm trong thư mục `src-tauri/target/release/QuickType.exe`):

### 1. Build bản thường (Standard / Non-Admin)
Không yêu cầu quyền Administrator khi mở ứng dụng:
```bash
npm run build:exe
```

### 2. Build bản Administrator (Elevated)
Tự động kích hoạt quyền Admin khi mở (vượt quyền UAC để gõ tắt trên các ứng dụng elevated):
```bash
npm run build:admin
```

---

## 📄 Giấy phép

Dự án được phân phối dưới giấy phép [MIT](LICENSE).
