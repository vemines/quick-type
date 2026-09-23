use crate::models::AppData;
use std::fs::{copy, create_dir_all, rename, File};
use std::io::{Read, Write};
use std::path::PathBuf;

pub fn get_data_dir() -> PathBuf {
    let base = dirs::document_dir().unwrap_or_else(|| PathBuf::from("."));
    base.join("QuickType")
}

pub fn get_data_path() -> PathBuf {
    get_data_dir().join("data.json")
}

pub fn get_backup_path() -> PathBuf {
    get_data_dir().join("data.json.bak")
}

/// Tries to parse AppData from a file path
fn try_read_file(path: &PathBuf) -> Result<AppData, String> {
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).map_err(|e| e.to_string())?;
    serde_json::from_str::<AppData>(&contents).map_err(|e| e.to_string())
}

pub fn load_app_data() -> AppData {
    let path = get_data_path();
    let bak_path = get_backup_path();

    // 1. If data.json exists, attempt to read and parse it
    if path.exists() {
        match try_read_file(&path) {
            Ok(data) => return data,
            Err(err) => {
                eprintln!("Warning: data.json is corrupted or invalid: {}. Attempting recovery...", err);

                // Preserve corrupted file for forensics/manual recovery
                let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
                let corrupted_path = get_data_dir().join(format!("data.json.corrupted.{}", timestamp));
                let _ = copy(&path, &corrupted_path);

                // 2. Try to recover from backup
                if bak_path.exists() {
                    if let Ok(bak_data) = try_read_file(&bak_path) {
                        eprintln!("Successfully recovered data from data.json.bak!");
                        let _ = save_app_data(&bak_data);
                        return bak_data;
                    }
                }

                // 3. Both failed: start new but DO NOT overwrite corrupted data.json
                eprintln!("Unable to recover from backup. Starting with clean default state without overwriting disk.");
                return AppData::default();
            }
        }
    }

    // 4. First run (file does not exist): create and save default data
    let default_data = AppData::default();
    let _ = save_app_data(&default_data);
    default_data
}

pub fn save_app_data(data: &AppData) -> Result<(), String> {
    let dir = get_data_dir();
    if !dir.exists() {
        create_dir_all(&dir).map_err(|e| format!("Failed to create QuickType directory: {}", e))?;
    }

    let path = get_data_path();
    let temp_path = dir.join("data.json.tmp");
    let bak_path = get_backup_path();

    let json = serde_json::to_string_pretty(data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;

    // Step 1: Write to temporary file and flush completely to disk
    {
        let mut file = File::create(&temp_path)
            .map_err(|e| format!("Failed to create data.json.tmp file: {}", e))?;
        file.write_all(json.as_bytes())
            .map_err(|e| format!("Failed to write data to temp file: {}", e))?;
        file.flush()
            .map_err(|e| format!("Failed to flush temp file: {}", e))?;
        file.sync_all()
            .map_err(|e| format!("Failed to sync temp file to disk: {}", e))?;
    }

    // Step 2: Create a backup snapshot of existing data.json if it exists and is valid
    if path.exists() {
        let _ = copy(&path, &bak_path);
    }

    // Step 3: Atomic rename temp file to target data.json
    if let Err(e) = rename(&temp_path, &path) {
        // Fallback: If rename failed on some Windows configurations, copy and delete
        copy(&temp_path, &path).map_err(|err| format!("Atomic rename and fallback copy failed: {} / {}", e, err))?;
        let _ = std::fs::remove_file(&temp_path);
    }

    Ok(())
}
