#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod saves;

use std::sync::Mutex;
use tauri::{ipc::InvokeBody, Manager};
use tauri_plugin_opener::OpenerExt;

#[derive(Default)]
struct SavedFile(Mutex<Option<std::path::PathBuf>>);

#[tauri::command]
async fn save_file(
    app: tauri::AppHandle,
    state: tauri::State<'_, SavedFile>,
    request: tauri::ipc::Request<'_>,
) -> Result<(), String> {
    let InvokeBody::Raw(bytes) = request.body() else {
        return Err("文件内容必须是二进制数据。".into());
    };
    let encoded = request
        .headers()
        .get("x-file-name")
        .and_then(|value| value.to_str().ok())
        .ok_or("缺少文件名。")?;
    let name = percent_encoding::percent_decode_str(encoded)
        .decode_utf8()
        .map_err(|_| "文件名编码无效。")?;
    let directory = app
        .path()
        .download_dir()
        .map_err(|e| e.to_string())?
        .join("PDF裁纸台");
    let saved = saves::save(&directory, &name, bytes).map_err(|e| format!("保存失败：{e}"))?;
    *state.0.lock().map_err(|e| e.to_string())? = Some(saved);
    Ok(())
}

#[tauri::command]
fn reveal_saved_file(
    app: tauri::AppHandle,
    state: tauri::State<'_, SavedFile>,
) -> Result<(), String> {
    let saved = state.0.lock().map_err(|e| e.to_string())?.clone();
    if let Some(path) = saved {
        app.opener()
            .reveal_item_in_dir(path)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .manage(SavedFile::default())
        .invoke_handler(tauri::generate_handler![save_file, reveal_saved_file])
        .run(tauri::generate_context!())
        .expect("无法启动 PDF 裁纸台");
}
