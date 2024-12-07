use serde::Serialize;
use std::fs;
use std::path::Path;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_directory_structure])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Serialize)]
struct FileNode {
    name: String,
    #[serde(rename = "type")]
    file_type: String,
    children: Option<Vec<FileNode>>,
}

#[tauri::command]
fn get_directory_structure(path: String) -> Result<Vec<FileNode>, String> {
    fn read_dir(path: &Path) -> Result<Vec<FileNode>, String> {
        let mut nodes = Vec::new();
        for entry in fs::read_dir(path).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            let name = entry
                .file_name()
                .to_string_lossy() // Convert OsString to a String
                .into_owned();
            if path.is_dir() {
                nodes.push(FileNode {
                    name,
                    file_type: "directory".to_string(),
                    children: Some(read_dir(&path)?),
                });
            } else {
                nodes.push(FileNode {
                    name,
                    file_type: "file".to_string(),
                    children: None,
                });
            }
        }
        Ok(nodes)
    }

    read_dir(Path::new(&path))
}
