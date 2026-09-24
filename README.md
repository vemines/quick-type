# ⚡ Quick Type - Smart Text Expander

<p align="center">
  <img src="public/favicon.ico" alt="Quick Type Logo" width="80" height="80" />
</p>

<p align="center">
  <b>A modern, smart text expansion and snippet utility for Windows.</b>
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

## 🌟 Key Features

- 🚀 **Fast Text Expansion**:
  - **Hotkey Mode**: Press the trigger hotkey (default: <kbd>`</kbd>).
  - **Auto Replace Mode**: Automatically detects and replaces keywords immediately as you type.
- 📁 **Multi-Group & Environment Management**:
  - Organize snippets by groups (*Work, Personal, Customer Support...*).
  - Click to switch active group directly within Environment Manager or from the system tray menu.
  - Safe group deletion with custom confirmation modals displaying affected shortcut counts.
- 🕒 **Dynamic Variables & Nested Templates**:
  - **System Variables**: Quick insertion of `{{date}}`, `{{time}}`, `{{datetime}}`, and `{{date:dddd}}` via the built-in variable dropdown.
  - **Custom Formatting (`{{date:FORMAT}}`)**: Supports Windows OS date formatting patterns and time insertion.
  - **Language Overrides (`{{date:FORMAT | LOCALE}}`)**: Force specific language locales regardless of OS defaults (e.g. `{{date:dddd | en}}` -> `Thursday`).
  - **Nested Snippets (up to 5 levels)**: Reuse child snippets inside parent snippets (e.g. `{{phone}}`). Automatically protected against recursion and circular references.
- 📥 **Import / Export**:
  - Full backup and restore using clean JSON files.
- 🛡️ **Dual Edition Architecture**:
  - **Standard Edition**: Portable, run immediately without Administrator privileges.
  - **Administrator Edition**: Run elevated with UAC manifest to expand text across all applications (elevated command prompts, accounting software, IDEs running as Admin).

---

## 🕒 Variable Reference Table

| Syntax | Description | Example Output |
| :--- | :--- | :--- |
| `{{date}}` | Current date (default format) | `24/09/2026` |
| `{{time}}` | Current time (24h format) | `08:30` |
| `{{datetime}}` | Combined date and time | `24/09/2026 08:30` |
| `{{date:dddd}}` | Full day of the week (system language) | `Thursday` / `Thứ Năm` |
| `{{date:ddd}}` | Abbreviated day of the week | `Thu` / `T5` |
| `{{date:dd}}` | Day of the month (2 digits) | `24` |
| `{{date:d}}` | Day of the month (1-2 digits) | `24` |
| `{{date:MM}}` | Month (2 digits) | `09` |
| `{{date:M}}` | Month (1-2 digits) | `9` |
| `{{date:MMM}}` | Abbreviated month name | `Sep` / `Thg 9` |
| `{{date:MMMM}}` | Full month name | `September` / `Tháng 9` |
| `{{date:yyyy}}` | 4-digit year | `2026` |
| `{{date:yy}}` | 2-digit year | `26` |
| `{{date:d/M/yyyy}}` | Compact date (no leading zeros) | `24/9/2026` |
| `{{date:yyyyMMdd}}` | Continuous numeric date (filenames, invoices) | `20260924` |
| `{{date:HH:mm:ss}}` | Time with seconds | `14:30:45` |
| `{{date:dd/MM/yyyy HH:mm:ss}}` | Full date & time with seconds | `24/09/2026 14:30:45` |
| `{{date:dddd | en}}` | Force English day of week | `Thursday` |
| `{{date:MMMM d, yyyy | en}}` | US standard date format | `September 24, 2026` |
| `{{shortcut}}` | Nested custom snippet from active group | *(Snippet content)* |

---

## 🛡️ Edition Comparison (Standard vs Admin)

| Feature | Standard Edition (`QuickType.exe`) | Administrator Edition (`QuickType_admin.exe`) |
| :--- | :--- | :--- |
| **Admin Rights** | **Not required** | **Required** (elevated UAC) |
| **App Support** | Standard apps (Word, Excel, Chrome, Zalo, VS Code...) | All apps including elevated windows (Admin CMD/PowerShell, accounting software, Task Manager) |
| **User Experience** | Double-click and run instantly without UAC prompt | Prompts Windows UAC on launch |
| **Recommended For** | General office work, restricted workplace computers | IT admins, accountants, power users |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend / Core**: Rust, Tauri v2.
- **Windows System API**: Low-level Keyboard Hook (`WH_KEYBOARD_LL`), Win32 Clipboard API, Taskbar Created Message Listener.

---

## 💻 Getting Started & Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ or LTS recommended).
- [Rust & Cargo](https://www.rust-lang.org/tools/install) (1.77.2+ recommended).
- Visual Studio C++ Build Tools (for Windows).

### Install dependencies
```bash
npm install
```

### Run in Development Mode
```bash
npm run tauri:dev
```

---

## 📦 Packaging (Build Standalone EXE)

The project supports building standalone portable `.exe` binaries into `src-tauri/target/release/`:

### 1. Build Standard Edition (Non-Admin)
```bash
npm run build:exe
```

### 2. Build Administrator Edition
```bash
npm run build:admin
```

---

## 📄 License

This project is licensed under the [MIT](LICENSE) License.

---

<div align="center">
  <sub>Crafted with passion 💖 by <a href="https://github.com/vemines">VeMines</a></sub>
</div>
