use std::{
    fs::{self, OpenOptions},
    io::{self, Write},
    path::{Path, PathBuf},
};

fn safe_name(name: &str) -> io::Result<String> {
    let cleaned: String = name
        .chars()
        .map(|c| {
            if c.is_control() || "\\/:*?\"<>|".contains(c) {
                '_'
            } else {
                c
            }
        })
        .collect();
    let cleaned = cleaned.trim().trim_matches('.');
    let path = Path::new(cleaned);
    let extension = path.extension().and_then(|s| s.to_str()).unwrap_or("");
    if !extension.eq_ignore_ascii_case("pdf") && !extension.eq_ignore_ascii_case("zip") {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "只允许导出 PDF 或 ZIP 文件。",
        ));
    }
    let stem = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("download");
    let device = stem
        .split('.')
        .next()
        .unwrap_or("")
        .trim_end()
        .to_ascii_uppercase();
    let reserved = matches!(
        device.as_str(),
        "CON" | "PRN" | "AUX" | "NUL" | "CONIN$" | "CONOUT$"
    ) || ["COM", "LPT"].iter().any(|prefix| {
        device.strip_prefix(prefix).is_some_and(|n| {
            matches!(
                n,
                "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "¹" | "²" | "³"
            )
        })
    });
    // Keep room for the extension and collision suffix on common filesystems.
    let mut short = String::new();
    for c in stem.chars() {
        if short.len() + c.len_utf8() > 180 {
            break;
        }
        short.push(c);
    }
    if short.is_empty() {
        short.push_str("download");
    }
    Ok(format!(
        "{}{short}.{extension}",
        if reserved { "_" } else { "" }
    ))
}

pub fn save(directory: &Path, name: &str, bytes: &[u8]) -> io::Result<PathBuf> {
    let name = safe_name(name)?;
    fs::create_dir_all(directory)?;
    let path = Path::new(&name);
    let stem = path.file_stem().unwrap().to_string_lossy();
    let extension = path.extension().unwrap().to_string_lossy();
    for count in 0..10_000 {
        let target = directory.join(if count == 0 {
            name.clone()
        } else {
            format!("{stem} ({count}).{extension}")
        });
        match OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&target)
        {
            Ok(mut file) => {
                if let Err(error) = file.write_all(bytes).and_then(|_| file.flush()) {
                    drop(file);
                    let _ = fs::remove_file(&target);
                    return Err(error);
                }
                return Ok(target);
            }
            Err(error) if error.kind() == io::ErrorKind::AlreadyExists => continue,
            Err(error) => return Err(error),
        }
    }
    Err(io::Error::new(
        io::ErrorKind::AlreadyExists,
        "同名文件过多，请清理导出文件夹。",
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keeps_names_inside_download_directory() {
        assert_eq!(safe_name("../../测试.pdf").unwrap(), "_.._测试.pdf");
        assert_eq!(safe_name("CON.pdf").unwrap(), "_CON.pdf");
        assert_eq!(safe_name("com1.zip").unwrap(), "_com1.zip");
        assert!(safe_name("payload.exe").is_err());
        assert!(safe_name("..").is_err());
        assert!(
            safe_name(&format!("{}.pdf", "文".repeat(200)))
                .unwrap()
                .len()
                < 200
        );
    }

    #[test]
    fn concurrent_saves_never_overwrite_existing_files() {
        let directory = std::env::temp_dir().join(format!(
            "pdf-cutter-test-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        fs::create_dir_all(&directory).unwrap();
        fs::write(directory.join("测试.pdf"), b"original").unwrap();
        let workers: Vec<_> = (0..6)
            .map(|i| {
                let directory = directory.clone();
                std::thread::spawn(move || save(&directory, "测试.pdf", &[i]).unwrap())
            })
            .collect();
        for worker in workers {
            assert!(worker.join().unwrap().exists());
        }
        assert_eq!(fs::read(directory.join("测试.pdf")).unwrap(), b"original");
        assert_eq!(fs::read_dir(&directory).unwrap().count(), 7);
        fs::remove_dir_all(directory).unwrap();
    }
}
