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
  - **Chế độ phím kích hoạt (Hotkey Mode)**: Nhấn phím kích hoạt (mặc định phím <kbd>`</kbd>).
  - **Tự động gõ nhanh (Auto Replace)**: Tự động nhận diện và thay thế ngay lập tức khi gõ xong từ tắt.
- 📁 **Quản lý đa nhóm / Môi trường (Environments)**:
  - Phân chia nhóm từ tắt theo môi trường (*Công việc, Khách hàng, Cá nhân...*).
  - Nhấp trực tiếp để chuyển đổi nhóm trong Quản lý nhóm hoặc từ menu khay hệ thống (System Tray).
  - Hộp thoại xác nhận xóa nhóm an toàn kèm cảnh báo số lượng từ tắt sẽ bị xóa vĩnh viễn.
- 🕒 **Biến Ngày Giờ & lồng nhau**:
  - **Chèn biến nhanh**: Nút "Chèn biến" trực quan có sẵn các biến `{{date}}`, `{{time}}`, `{{datetime}}`, `{{date:dddd}}` và danh sách từ tắt trong nhóm.
  - **Định dạng tùy biến (`{{date:FORMAT}}`)**: Hỗ trợ đầy đủ định dạng ngày giờ của Windows OS.
  - **Ép ngôn ngữ hiển thị (`{{date:FORMAT | LOCALE}}`)**: Ép ngôn ngữ sang tiếng Anh, Pháp, Việt... bất kể cài đặt vùng của máy tính (ví dụ: `{{date:dddd | en}}` ➔ `Thursday`).
  - **Lồng từ tắt con (tối đa 5 tầng)**: Tái sử dụng từ tắt con bên trong từ tắt cha (ví dụ `{{sdt}}`). Hệ thống tự động chặn ở tầng thứ 5 để chống vòng lặp vô tận.
- 📥 **Nhập / Xuất dữ liệu**:
  - Sao lưu và phục hồi cấu hình đầy đủ dưới dạng file JSON.
- 🛡️ **Hỗ trợ 2 phiên bản độc lập**:
  - **Bản Thường**: File chạy ngay không cần cài đặt, không đòi hỏi quyền Administrator.
  - **Bản Administrator**: Chạy với quyền Admin tối cao để gõ tắt trên 100% ứng dụng (cmd admin, phần mềm kế toán, IDEs...).

---

## 🕒 Bảng tra cứu biến Ngày & Giờ

| Cú pháp | Ý nghĩa | Ví dụ kết quả |
| :--- | :--- | :--- |
| `{{date}}` | Ngày hiện tại (mặc định) | `24/09/2026` |
| `{{time}}` | Giờ hiện tại (24h) | `08:30` |
| `{{datetime}}` | Ngày và giờ kết hợp | `24/09/2026 08:30` |
| `{{date:dddd}}` | Thứ trong tuần đầy đủ (theo ngôn ngữ máy) | `Thứ Năm` / `Thursday` |
| `{{date:ddd}}` | Thứ viết tắt | `T5` / `Thu` |
| `{{date:dd}}` | Ngày 2 chữ số | `24` |
| `{{date:d}}` | Ngày (1 hoặc 2 chữ số) | `24` |
| `{{date:MM}}` | Tháng 2 chữ số | `09` |
| `{{date:M}}` | Tháng (1 hoặc 2 chữ số) | `9` |
| `{{date:MMM}}` | Tháng viết tắt | `Thg 9` / `Sep` |
| `{{date:MMMM}}` | Tháng đầy đủ | `Tháng 9` / `September` |
| `{{date:yyyy}}` | Năm 4 chữ số | `2026` |
| `{{date:yy}}` | Năm 2 số cuối | `26` |
| `{{date:d/M/yyyy}}` | Ngày tháng năm gọn (bỏ số 0 đứng trước) | `24/9/2026` |
| `{{date:yyyyMMdd}}` | Chuỗi số liền (đặt tên file, hóa đơn) | `20260924` |
| `{{date:HH:mm:ss}}` | Giờ kèm giây | `14:30:45` |
| `{{date:dd/MM/yyyy HH:mm:ss}}` | Ngày và giờ chi tiết đến giây | `24/09/2026 14:30:45` |
| `{{date:dddd | en}}` | Thứ bằng tiếng Anh (`en`) | `Thursday` |
| `{{date:MMMM d, yyyy | en}}` | Ngày tháng chuẩn tiếng Anh | `September 24, 2026` |
| `{{từ_tắt}}` | Lồng từ tắt khác trong nhóm | *(Nội dung từ tắt)* |

---

## 🛡️ So sánh 2 phiên bản (Bản Thường vs Bản Admin)

| Tiêu chí | Bản Thường (`QuickType.exe`) | Bản Administrator (`QuickType_admin.exe`) |
| :--- | :--- | :--- |
| **Quyền Administrator** | **Không cần** | **Bắt buộc** (có UAC manifest) |
| **Ứng dụng hỗ trợ** | Ứng dụng phổ thông (Word, Excel, Chrome, Zalo, VS Code...) | Toàn bộ ứng dụng bao gồm cửa sổ Admin (cmd, powershell, app kế toán...) |
| **Trải nghiệm khởi chạy** | Nhấp đúp mở ngay, không bị hỏi UAC | Xuất hiện hộp thoại hỏi quyền Admin (UAC) |
| **Khuyên dùng cho** | Người dùng văn phòng, máy tính công ty bị chặn quyền Admin | IT, lập trình viên, kế toán, người dùng nâng cao |

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

## 📦 Hướng dẫn đóng gói (Build EXE Độc Lập)

Dự án hỗ trợ đóng gói trực tiếp ra file `.exe` portable độc lập trong `src-tauri/target/release/`:

### 1. Build bản thường (Standard / Non-Admin)
```bash
npm run build:exe
```

### 2. Build bản Administrator
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