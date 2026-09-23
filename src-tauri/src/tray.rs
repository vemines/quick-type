use std::sync::atomic::{AtomicU32, Ordering};
use tauri::{
    menu::{CheckMenuItemBuilder, Menu, MenuItem, PredefinedMenuItem, SubmenuBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};
use windows_sys::Win32::Foundation::{HWND, LPARAM, LRESULT, WPARAM};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    CreateWindowExW, DefWindowProcW, DestroyWindow, DispatchMessageW, GetMessageW,
    RegisterClassW, RegisterWindowMessageW, TranslateMessage, MSG, WNDCLASSW, WS_POPUP,
};
use crate::expander::EXPANDER_STATE;

static TASKBAR_CREATED_MSG: AtomicU32 = AtomicU32::new(0);
static APP_HANDLE_HOLDER: once_cell::sync::Lazy<std::sync::Mutex<Option<AppHandle>>> =
    once_cell::sync::Lazy::new(|| std::sync::Mutex::new(None));

pub fn build_tray_menu(app: &AppHandle) -> Result<Menu<tauri::Wry>, Box<dyn std::error::Error>> {
    // Read current state
    let is_enabled = EXPANDER_STATE
        .read()
        .map(|s| s.enabled)
        .unwrap_or(true);

    let toggle_title = if is_enabled {
        "⏸️ Tạm dừng gõ tắt"
    } else {
        "▶️ Tiếp tục gõ tắt"
    };

    let open_item = MenuItem::with_id(app, "open", "⚡ Mở Quick Type", true, None::<&str>)?;
    let sep1 = PredefinedMenuItem::separator(app)?;
    let toggle_item = MenuItem::with_id(app, "toggle", toggle_title, true, None::<&str>)?;
    let sep2 = PredefinedMenuItem::separator(app)?;

    // Build environments submenu
    let app_data = crate::storage::load_app_data();
    let active_env_name = app_data
        .environments
        .iter()
        .find(|e| e.id == app_data.active_environment_id)
        .map(|e| e.name.as_str())
        .unwrap_or("Mặc định");

    let submenu_title = format!("📁 Môi trường ({})", active_env_name);
    let mut env_submenu_builder = SubmenuBuilder::new(app, &submenu_title);

    if app_data.environments.is_empty() {
        let empty_item = MenuItem::with_id(app, "no_env", "(Không có môi trường)", false, None::<&str>)?;
        env_submenu_builder = env_submenu_builder.item(&empty_item);
    } else {
        for env in &app_data.environments {
            let is_active = env.id == app_data.active_environment_id;
            let check_item = CheckMenuItemBuilder::new(&env.name)
                .id(format!("env:{}", env.id))
                .checked(is_active)
                .build(app)?;
            env_submenu_builder = env_submenu_builder.item(&check_item);
        }
    }

    let env_submenu = env_submenu_builder.build()?;
    let sep3 = PredefinedMenuItem::separator(app)?;
    let quit_item = MenuItem::with_id(app, "quit", "❌ Thoát", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &open_item,
            &sep1,
            &toggle_item,
            &sep2,
            &env_submenu,
            &sep3,
            &quit_item,
        ],
    )?;

    Ok(menu)
}

pub fn update_tray_menu(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(tray) = app.tray_by_id("main-tray") {
        let menu = build_tray_menu(app)?;
        tray.set_menu(Some(menu))?;
    }
    Ok(())
}

pub fn create_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // If tray icon with this ID already exists, do not duplicate
    if app.tray_by_id("main-tray").is_some() {
        return Ok(());
    }

    let menu = build_tray_menu(app)?;

    // Safe icon resolution with guaranteed embedded fallback bytes
    let icon = if let Some(icon) = app.default_window_icon() {
        icon.clone()
    } else {
        tauri::image::Image::from_bytes(include_bytes!("../icons/32x32.png"))?
    };

    let _tray = TrayIconBuilder::with_id("main-tray")
        .tooltip("Quick Type - Smart Text Expander")
        .icon(icon)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| {
            let id_str = event.id.as_ref();
            match id_str {
                "open" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.unminimize();
                        let _ = window.set_focus();
                    }
                }
                "toggle" => {
                    if let Ok(mut state) = EXPANDER_STATE.write() {
                        state.enabled = !state.enabled;
                    }
                    let _ = update_tray_menu(app);
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {
                    if let Some(env_id) = id_str.strip_prefix("env:") {
                        let mut data = crate::storage::load_app_data();
                        if data.environments.iter().any(|e| e.id == env_id) {
                            data.active_environment_id = env_id.to_string();
                            let _ = crate::storage::save_app_data(&data);
                            crate::commands::sync_expander_from_data(&data);
                            let _ = update_tray_menu(app);
                            let _ = app.emit("environment-changed", env_id.to_string());
                        }
                    }
                }
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    if let Ok(is_visible) = window.is_visible() {
                        if is_visible {
                            let _ = window.hide();
                        } else {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                        }
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}

pub fn ensure_tray_exists(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    if app.tray_by_id("main-tray").is_some() {
        return Ok(());
    }
    create_tray(app)
}

pub fn recreate_tray(app: &AppHandle) {
    let _ = app.remove_tray_by_id("main-tray");
    let _ = create_tray(app);
}

unsafe extern "system" fn taskbar_listener_wndproc(
    hwnd: HWND,
    msg: u32,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    let tb_msg = TASKBAR_CREATED_MSG.load(Ordering::SeqCst);
    if tb_msg != 0 && msg == tb_msg {
        if let Ok(guard) = APP_HANDLE_HOLDER.lock() {
            if let Some(ref app) = *guard {
                recreate_tray(app);
            }
        }
        return 0;
    }
    DefWindowProcW(hwnd, msg, wparam, lparam)
}

pub fn start_taskbar_created_listener(app: AppHandle) {
    {
        if let Ok(mut guard) = APP_HANDLE_HOLDER.lock() {
            *guard = Some(app);
        }
    }

    std::thread::spawn(|| unsafe {
        let taskbar_str: Vec<u16> = "TaskbarCreated\0".encode_utf16().collect();
        let msg_id = RegisterWindowMessageW(taskbar_str.as_ptr());
        if msg_id != 0 {
            TASKBAR_CREATED_MSG.store(msg_id, Ordering::SeqCst);
        }

        let class_name: Vec<u16> = "QuickType_TaskbarWatcher\0".encode_utf16().collect();
        let hinstance = windows_sys::Win32::System::LibraryLoader::GetModuleHandleW(std::ptr::null());

        let wc = WNDCLASSW {
            style: 0,
            lpfnWndProc: Some(taskbar_listener_wndproc),
            cbClsExtra: 0,
            cbWndExtra: 0,
            hInstance: hinstance,
            hIcon: 0 as _,
            hCursor: 0 as _,
            hbrBackground: 0 as _,
            lpszMenuName: std::ptr::null(),
            lpszClassName: class_name.as_ptr(),
        };

        RegisterClassW(&wc);

        let hwnd = CreateWindowExW(
            0,
            class_name.as_ptr(),
            class_name.as_ptr(),
            WS_POPUP,
            0,
            0,
            0,
            0,
            0 as HWND,
            0 as _,
            hinstance,
            std::ptr::null(),
        );

        if hwnd != 0 as HWND {
            let mut msg: MSG = std::mem::zeroed();
            while GetMessageW(&mut msg, 0 as HWND, 0, 0) > 0 {
                TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }
            DestroyWindow(hwnd);
        }
    });
}
