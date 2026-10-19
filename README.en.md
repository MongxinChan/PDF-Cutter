# PDF Cutter · PDF Splitter

[简体中文](README.md) | **English**

A lightweight, free and open-source **PDF splitter** for the browser, Windows and macOS. Split PDFs by page count, file size or custom page ranges. No account required — your documents are processed locally and never uploaded to a server.

**[Try it online](https://www.loners.site/PDF-Cutter/) · [Download the desktop app](https://github.com/MongxinChan/PDF-Cutter/releases/latest) · [Report an issue](https://github.com/MongxinChan/PDF-Cutter/issues)**

[![Latest release](https://img.shields.io/github/v/release/MongxinChan/PDF-Cutter?label=release)](https://github.com/MongxinChan/PDF-Cutter/releases/latest)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

- **Local processing:** your PDFs stay on your device. The desktop app bundles its processing libraries and works offline.
- **Three splitting modes:** page count, file size and custom ranges. File size and page count limits can be combined.
- **Batch export:** download individual files, save all parts in sequence or export a ZIP archive.
- **Small desktop downloads:** the v1.0.1 Windows installer is approximately **1.31 MiB**; the portable executable is approximately **3.32 MiB**.
- **Cross-platform:** use it in your browser or download the Windows or macOS app.

> The Windows desktop app requires WebView2. These download sizes exclude the full runtime. The installer downloads it if missing; the portable executable requires WebView2 to be installed already.

## See it in action

![PDF Cutter splitting a 120-page sample handout into three 40-page PDFs, with individual downloads and ZIP export](docs/images/pdf-cutter-demo.png)

*Actual app screenshot using a generated sample handout: 120 pages → 3 files of 40 pages each.*

The app currently has a Simplified Chinese interface. The instructions below include the original button labels.

## What can you use it for?

- **Organize textbooks and course notes:** extract chapter ranges or divide a document into files with a fixed number of pages.
- **Prepare documents for AI tools:** split PDFs to fit the file size and page limits of Claude or other tools.
- **Share large PDFs or scanned documents:** split them by target size, then save the results individually or as a ZIP archive.

| Mode | Example |
| --- | --- |
| Page count | Split a 120-page handout into 3 files of 40 pages each |
| File size | Keep each file under 10 MB, with at most 50 pages per file |
| Custom ranges | Enter `1-20, 35-60, 80-` to extract those page ranges |

Size-based splitting checks the actual output size. If a single page already exceeds your limit, the app keeps that page and displays a warning.

## Get started in three steps

1. Open the **[web app](https://www.loners.site/PDF-Cutter/)** or desktop app, then drag in a PDF or click the file area to select one.
2. Choose a splitting mode and enter your settings. Review the page-range preview.
3. Click **开始切分** (Start splitting). Download the individual results or click **打包下载 ZIP** (Download ZIP).

The desktop app saves files to **Downloads / PDF裁纸台**. It adds a number to duplicate filenames instead of overwriting existing files, and opens the folder once after a batch export. In the web app, your browser controls where downloads are saved.

## Download the desktop app

Visit the **[latest release](https://github.com/MongxinChan/PDF-Cutter/releases/latest)** and choose the file for your system:

| System | Download |
| --- | --- |
| Windows x64, installer | `pdf-cutter-VERSION-windows-setup.exe` |
| Windows x64, portable | `pdf-cutter-VERSION-windows-portable.exe` |
| macOS, Apple Silicon (M1 and later) | `pdf-cutter-VERSION-mac-arm64.dmg` |
| macOS, Intel | `pdf-cutter-VERSION-mac-x64.dmg` |

The desktop app uses **Tauri 2 and the system WebView**. The Windows installer shrank from approximately **106.29 MiB** in the Electron-based v1.0.0 release to **1.31 MiB** in v1.0.1. This compares application download sizes: it excludes the WebView2 runtime and does not represent memory usage while processing PDFs.

Your system may show an unsigned-app warning on first launch. See the FAQ below.

## FAQ

<details>
<summary>Are my files uploaded? Can I use the app offline?</summary>

PDF loading, splitting and ZIP creation all happen locally. Your documents are not uploaded.

The web app needs to load its page and libraries when you first open it. The desktop app includes all processing libraries and works offline once installation and runtime setup are complete. You can also build a standalone offline web folder using the [development guide](docs/DEVELOPMENT.en.md).

</details>

<details>
<summary>Does this compress PDFs?</summary>

The tool splits and extracts PDF pages. It does not provide lossy image compression or page-margin cropping. If one page already exceeds your size limit, splitting cannot make that page fit; the app will flag it.

</details>

<details>
<summary>What are Claude's upload limits?</summary>

The interface includes an editable preset of 30 MB and 100 pages. Platform limits can vary by product, account and date, so use the limits shown by the service when you upload.

</details>

<details>
<summary>What if my system blocks the desktop app on first launch?</summary>

The app is not signed with purchased Apple or Microsoft developer certificates. After confirming that you downloaded it from this repository's [Releases](https://github.com/MongxinChan/PDF-Cutter/releases/latest):

- **Windows:** if you see “Windows protected your PC,” click “More info,” then “Run anyway.”
- **macOS:** if the developer cannot be verified, dismiss the warning, open “System Settings → Privacy & Security,” find the app and choose “Open Anyway.” On older macOS versions, you can also right-click the app in Applications and choose “Open.”
- **macOS:** if the app is reported as damaged, move it into Applications, verify the download source, then run this command in Terminal. Keep the application's original Chinese filename:

```bash
xattr -cr "/Applications/PDF 裁纸台.app"
```

</details>

## Local development

Use Node.js 24 LTS and Rust stable, and install the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your platform.

```bash
npm ci          # Install dependencies and prepare the offline PDF / ZIP libraries
npm start       # Start the desktop app in development mode
npm run dist    # Build packages for the current platform into dist/
```

See the **[development and build guide](docs/DEVELOPMENT.en.md)** for platform requirements, offline web builds, test commands and the project structure.

## Feedback and contributions

Bug reports and suggestions are welcome in [Issues](https://github.com/MongxinChan/PDF-Cutter/issues), as are pull requests. Include your operating system, app version, reproduction steps and any error messages. Use sample PDFs without personal or sensitive information.

If this tool helps you, consider starring the repository or sharing the web app with someone who needs to split PDFs.

## License

[MIT License](LICENSE)
