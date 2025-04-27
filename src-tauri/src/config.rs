use std::path::PathBuf;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct AppConfig {
    pub theme: String,
}

fn get_config_path() -> Option<PathBuf> {
    #[cfg(debug_assertions)]
    {
        // In development mode, store config in the local project directory
        let mut path = std::env::current_dir().ok()?;
        path.push(".dev-config");
        path.push("app_config.json");
        Some(path)
    }

    #[cfg(not(debug_assertions))]
    {
        // In production, use system config directory
        dirs::config_dir().map(|dir| dir.join("db-admin").join("app_config.json"))
    }
}

#[tauri::command]
pub fn set_theme(theme: String) -> Result<(), String> {
    let config = AppConfig { theme };
    let config_path = match get_config_path() {
        Some(path) => {
            // Ensure parent directory exists
            if let Some(parent) = path.parent() {
                if let Err(e) = std::fs::create_dir_all(parent) {
                    return Err(format!("Failed to create config directory: {}", e));
                }
            }
            path
        },
        None => return Err("Could not determine config directory".to_string()),
    };

    let config_json = match serde_json::to_string(&config) {
        Ok(json) => json,
        Err(e) => return Err(format!("Failed to serialize config: {}", e)),
    };

    match std::fs::write(config_path, config_json) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to write config file: {}", e)),
    }
}

#[tauri::command]
pub fn get_theme() -> Result<String, String> {
    let config_path = match get_config_path() {
        Some(path) => path,
        None => return Ok("light".to_string()),
    };

    if let Ok(metadata) = std::fs::metadata(&config_path) {
        if metadata.is_file() {
            match std::fs::read_to_string(config_path) {
                Ok(config_json) => {
                    match serde_json::from_str::<AppConfig>(&config_json) {
                        Ok(config) => return Ok(config.theme),
                        Err(_) => return Ok("light".to_string()),
                    }
                }
                Err(_) => return Ok("light".to_string()),
            }
        }
    }

    Ok("light".to_string())
}
