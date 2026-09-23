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
  - **Hotkey Mode**: Press the trigger key (default: <kbd>`</kbd> ).
  - **Auto Replace Mode**: Automatically detects and expands snippets immediately once typed.
- 📁 **Multi-Environment Management**:
  - Organize snippets by environments: *Work, Personal, ...*
- 🕒 **Datetime Variables & Nested Templates**:
  - **Default datetime variables**: `{{date}}` (DD/MM/YYYY), `{{time}}` (HH:mm), `{{datetime}}` (DD/MM/YYYY HH:mm).
  - **Custom date format (`{{date:FORMAT}}`)**:
    - `{{date:dddd}}`: Automatically formats Day of the week in user's OS system locale (`Wednesday`, `Thứ Tư`, `Mercredi`, `星期三`...).
    - `{{date:DD/MM/YYYY}}`, `{{date:YYYY}}`...
    - Explicit language overrides: `{{date:dddd | fr}}` (French), `{{date:dddd | en}}` (English), `{{date:dddd | vi}}` (Vietnamese)...
  - **Nested Snippets (up to 5 levels)**: Reuse child snippets inside parent snippets (e.g. `{{snippet_name}}`). Automatically stops at level 5 to prevent infinite loops.
- 📥 **Import / Export**:
  - Full backup and restore using JSON files.
- 🛡️ **Admin / Standard Build Options**:
  - **Standard Build**: Run with standard user privileges.
  - **Administrator Build**: Run with Administrator privileges applied across all applications.

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

## 📦 Packaging (Build EXE)

The project supports 2 packaging modes that compile directly into standalone `.exe` files (located in `src-tauri/target/release/QuickType.exe`):

### 1. Build Standard Version (Non-Admin)
Does not require Administrator privileges when opening the app:
```bash
npm run build:exe
```

### 2. Build Administrator Version
Runs with Administrator privileges when opened:
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
