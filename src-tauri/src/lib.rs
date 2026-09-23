pub mod commands;
pub mod expander;
pub mod models;
pub mod storage;
pub mod tray;

use tauri::{Manager, WindowEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 1. Preload data and sync initial state
    let initial_data = storage::load_app_data();
    if let Ok(mut state) = expander::EXPANDER_STATE.write() {
        state.trigger_hotkey = initial_data.settings.trigger_hotkey.clone();
        state.auto_replace = initial_data.settings.auto_replace;

        if let Some(active_env) = initial_data
            .environments
            .iter()
            .find(|e| e.id == initial_data.active_environment_id)
        {
            for snippet in &active_env.snippets {
                state.all_snippets.insert(
                    snippet.shortcut.to_lowercase(),
                    snippet.content.clone(),
                );
                if snippet.is_enabled {
                    state.active_snippets.insert(
                        snippet.shortcut.to_lowercase(),
                        snippet.content.clone(),
                    );
                }
            }
        }
    }

    // 2. Start global low-level keyboard hook & watchdog
    expander::start_keyboard_hook();
    expander::start_hook_watchdog();

    tauri::Builder::default()
        // Single instance plugin: ensures duplicate launches restore the existing window & tray
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
            let _ = tray::ensure_tray_exists(app);
        }))
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::default(),
            Some(vec!["--autostart"]),
        ))
        .invoke_handler(tauri::generate_handler![
            commands::get_initial_data,
            commands::save_data,
            commands::toggle_expansion,
            commands::is_expansion_enabled,
        ])
        .setup(|app| {
            // Start listening for Windows Explorer restart (TaskbarCreated)
            tray::start_taskbar_created_listener(app.handle().clone());

            // Setup System Tray with retry logic in case Explorer is slow at startup
            let handle_clone = app.handle().clone();
            if let Err(e) = tray::create_tray(&handle_clone) {
                eprintln!("Initial tray creation failed: {}. Starting retry loop...", e);
                std::thread::spawn(move || {
                    for _ in 0..15 {
                        std::thread::sleep(std::time::Duration::from_secs(2));
                        if tray::create_tray(&handle_clone).is_ok() {
                            break;
                        }
                    }
                });
            }

            // Optional: Hide on startup if opened with --autostart
            let args: Vec<String> = std::env::args().collect();
            if args.iter().any(|arg| arg == "--autostart") {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // Check if run_in_background is enabled
                let app_data = storage::load_app_data();
                if app_data.settings.run_in_background {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Quick Type tauri application");
}
