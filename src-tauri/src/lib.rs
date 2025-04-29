mod config;

#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_version,
            config::get_theme,
            config::set_theme
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}