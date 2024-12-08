use pdf_extract::extract_text;
use pulldown_cmark::{html, Options, Parser};
use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use tauri::command;

#[command]
async fn read_file_content(path: String) -> Result<String, String> {
    // Convert to PathBuf and get the absolute path
    let path_buf = PathBuf::from(&path);
    let absolute_path = match path_buf.canonicalize() {
        Ok(abs_path) => abs_path,
        Err(e) => return Err(format!("Failed to get absolute path: {}", e)),
    };

    println!(
        "Attempting to read file at absolute path: {:?}",
        absolute_path
    );

    // Determine the file extension
    let extension = absolute_path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("");

    // Handle files based on their type
    match extension {
        "txt" => match fs::read_to_string(&absolute_path) {
            Ok(content) => Ok(content),
            Err(e) => Err(format!("Error reading text file: {}", e)),
        },
        "pdf" => match extract_text(&absolute_path) {
            Ok(content) => Ok(content),
            Err(e) => Err(format!("Error extracting text from PDF: {}", e)),
        },
        "md" => {
            match fs::read_to_string(&absolute_path) {
                Ok(content) => {
                    // Parse Markdown and convert to plain text
                    let parser = Parser::new_ext(&content, Options::empty());
                    let mut rendered_text = String::new();
                    html::push_html(&mut rendered_text, parser);
                    Ok(rendered_text)
                }
                Err(e) => Err(format!("Error reading Markdown file: {}", e)),
            }
        }
        _ => Err(format!("Unsupported file type: {}", extension)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_directory_structure,
            read_file_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Debug, Serialize)]
struct FileNode {
    name: String,
    r#type: String,
    path: String,
    children: Option<Vec<FileNode>>,
}

#[tauri::command]
fn get_directory_structure(path: String) -> Result<Vec<FileNode>, String> {
    let base_path = PathBuf::from(path);
    let absolute_base_path = match base_path.canonicalize() {
        Ok(p) => p,
        Err(e) => return Err(format!("Failed to get absolute path: {}", e)),
    };

    fn visit_dir(entry_path: PathBuf) -> Result<FileNode, std::io::Error> {
        let metadata = entry_path.metadata()?;
        let name = entry_path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string(); // Convert to String here

        let absolute_path = entry_path
            .canonicalize()?
            .to_string_lossy()
            .replace('\\', "/")
            .to_owned();

        if metadata.is_dir() {
            let mut children = Vec::new();
            for entry in std::fs::read_dir(&entry_path)? {
                let entry = entry?;
                children.push(visit_dir(entry.path())?);
            }
            children.sort_by(|a, b| a.name.cmp(&b.name));

            Ok(FileNode {
                name: name.to_string(), // Explicitly convert to String
                r#type: "directory".to_string(),
                path: absolute_path,
                children: Some(children),
            })
        } else {
            Ok(FileNode {
                name: name.to_string(), // Explicitly convert to String
                r#type: "file".to_string(),
                path: absolute_path,
                children: None,
            })
        }
    }

    match visit_dir(absolute_base_path) {
        Ok(root) => Ok(vec![root]),
        Err(e) => Err(e.to_string()),
    }
}
