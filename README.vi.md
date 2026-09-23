# ⚡ Quick Type - Smart Text Expander

<p align="center">
  <img src="public/favicon.ico" alt="Quick Type Logo" width="80" height="80" />
</p>

<p align="center">
  <b>Phần mềm gõ tắt văn bản thông minh, hiện đại dành cho Windows.</b>
</p>

<p align="center">
  <a href="README.md"><b>English</b></a> •
  <a href="README.vi.md"><b>Tiếng Việt</b></a>
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

- 🚀 **Gõ tắt nhanh**:
  - **Chế độ phím kích hoạt (Hotkey Mode)**: Nhấn phím kích hoạt (mặc định phím <kbd>\`</kbd> ).
  - **Tự động gõ nhanh (Auto Replace)**: Tự động nhận diện và thay thế ngay lập tức khi gõ xong từ tắt.
- 📁 **Quản lý đa môi trường (Environments)**:
  - Phân chia nhóm từ tắt theo môi trường: *Công việc, Người dùng, ...*
- 🕒 **Biến Ngày Tháng & lồng nhau**:
  - **Biến thời gian mặc định**: `{{date}}` (DD/MM/YYYY), `{{time}}` (HH:mm), `{{datetime}}` (DD/MM/YYYY HH:mm).
  - **Định dạng ngày tùy biến (`{{date:FORMAT}}`)**:
    - `{{date:dddd}}`: Tự động lấy Thứ theo ngôn ngữ máy tính người dùng (`Thứ Tư`, `Wednesday`, `星期三`...).
    - `{{date:DD/MM/YYYY}}`, `{{date:YYYY}}`...
    - Ép ngôn ngữ hiển thị: `{{date:dddd | fr}}` (Pháp), `{{date:dddd | en}}` (Anh), `{{date:dddd | vi}}` (Việt)...
  - **Lồng từ tắt (Nested Snippets - tối đa 5 tầng)**: Tái sử dụng từ tắt con bên trong từ tắt cha (ví dụ `{{ten_snippet}}`). Hệ thống tự động chặn ở tầng thứ 5 để chống vòng lặp vô tận (Infinite Loop).
- 📥 **Nhập / Xuất dữ liệu**:
  - Sao lưu và phục hồi cấu hình đầy đủ dạng file JSON.
- 🛡️ **Tùy chọn bản build Admin / Thường**:
  - **Bản thường**: Chạy với quyền người dùng.
  - **Bản Administrator**: Chạy quyền Admin để gõ tắt trên mọi ứng dụng.

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

### 2. Build bản Administrator
Chạy quyền Admin khi mở:
```bash
npm run build:admin
```

---

## 📄 Giấy phép

Dự án được phân phối dưới giấy phép [MIT](LICENSE).

---

<div align="center">
  <sub>Crafted with passion 💖 by <a href="https://github.com/vemines">VeMines</a></sub>
</div>