use crate::expander::EXPANDER_STATE;
use crate::models::AppData;
use crate::storage::{load_app_data, save_app_data as storage_save};
use std::collections::HashMap;

pub fn sync_expander_from_data(data: &AppData) {
    if let Ok(mut state) = EXPANDER_STATE.write() {
        state.trigger_hotkey = data.settings.trigger_hotkey.clone();
        state.auto_replace = data.settings.auto_replace;

        let mut active_map = HashMap::new();
        let mut all_map = HashMap::new();

        if let Some(active_env) = data
            .environments
            .iter()
            .find(|e| e.id == data.active_environment_id)
        {
            for snippet in &active_env.snippets {
                all_map.insert(
                    snippet.shortcut.to_lowercase(),
                    snippet.content.clone(),
                );
                if snippet.is_enabled {
                    active_map.insert(
                        snippet.shortcut.to_lowercase(),
                        snippet.content.clone(),
                    );
                }
            }
        }

        state.active_snippets = active_map;
        state.all_snippets = all_map;
    }
}

#[tauri::command]
pub fn get_initial_data() -> Result<AppData, String> {
    let data = load_app_data();
    sync_expander_from_data(&data);
    Ok(data)
}

#[tauri::command]
pub fn toggle_expansion() -> Result<bool, String> {
    if let Ok(mut state) = EXPANDER_STATE.write() {
        state.enabled = !state.enabled;
        Ok(state.enabled)
    } else {
        Err("Failed to acquire expander lock".to_string())
    }
}

#[tauri::command]
pub fn is_expansion_enabled() -> Result<bool, String> {
    if let Ok(state) = EXPANDER_STATE.read() {
        Ok(state.enabled)
    } else {
        Err("Failed to acquire expander lock".to_string())
    }
}

fn sync_task_scheduler_autostart(start_with_windows: bool) {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x08000000;

    let Ok(exe_path) = std::env::current_exe() else { return };
    let exe_str = exe_path.to_string_lossy().to_string();

    if start_with_windows {
        // Create scheduled task to bypass UAC block at logon for elevated app
        let task_action = format!("\"{}\" --autostart", exe_str);
        let _ = std::process::Command::new("schtasks")
            .args(&[
                "/create",
                "/tn",
                "QuickType_AdminAutostart",
                "/tr",
                &task_action,
                "/sc",
                "onlogon",
                "/rl",
                "highest",
                "/f",
            ])
            .creation_flags(CREATE_NO_WINDOW)
            .output();
    } else {
        // Delete scheduled task if disabled
        let _ = std::process::Command::new("schtasks")
            .args(&["/delete", "/tn", "QuickType_AdminAutostart", "/f"])
            .creation_flags(CREATE_NO_WINDOW)
            .output();
    }
}

#[tauri::command]
pub fn save_data(app: tauri::AppHandle, data: AppData) -> Result<(), String> {
    storage_save(&data)?;
    sync_expander_from_data(&data);
    sync_task_scheduler_autostart(data.settings.start_with_windows);
    let _ = crate::tray::update_tray_menu(&app);
    Ok(())
}
