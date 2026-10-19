# Development and builds

[简体中文](DEVELOPMENT.md) | **English**

[Back to the project overview](../README.en.md)

Use Node.js 24 LTS and [Rust stable](https://rustup.rs/). See the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for platform-specific setup:

- **Windows:** Visual Studio Build Tools with the “Desktop development with C++” workload (MSVC and Windows SDK), plus WebView2.
- **macOS:** Xcode Command Line Tools. Build DMG packages on macOS.

Run the following commands from the project root:

```bash
npm ci          # Install locked dependencies and copy pdf-lib / JSZip into lib/
npm start       # Start the desktop app in development mode
npm run dist    # Build packages for the current platform into dist/
```

Use `npm install` when intentionally updating dependencies and the lockfile. Desktop builds copy an explicit list of web assets into `web-dist/` and embed those assets in the executable. Source code, tests, node_modules and build toolchains are not included in the application package.

## Build commands

```bash
npm run dist:win     # On Windows: build an NSIS installer and a portable EXE
npm run dist:mac     # On macOS: build a DMG for the current architecture
npm run prepare:web # Assemble an offline web folder; open web-dist/index.html
```

The Windows installer uses LZMA compression. Rust release builds enable LTO, symbol stripping and size optimization. GitHub Actions builds Windows x64, macOS ARM64 and macOS x64 separately. The first build downloads and compiles Rust dependencies, so it takes longer than subsequent builds.

## Verification

```bash
npx playwright install chromium
npm test
npm run icon
npm run prepare:web
cargo test --locked --manifest-path src-tauri/Cargo.toml
```

Browser tests block external resources and cover the three splitting modes, PDF and ZIP exports, and recovery from desktop save failures. They simulate the desktop bridge. Rust tests cover filename restrictions and collision protection during concurrent saves. Actual WebView behavior still needs to be checked on the target operating system.

## Project structure

```text
index.html                    Shared web and desktop interface
i18n.js                       Chinese/English strings, URL language selection and preferences
desktop.js                    Tauri binary save bridge and environment detection
src-tauri/src/                Desktop entry point, native saving and collision protection
src-tauri/tauri.conf.json      Window, asset, security and installer configuration
scripts/copy-libs.js           Copy pdf-lib / JSZip into lib/ after dependency installation
scripts/prepare-web.js         Assemble the required offline web assets
scripts/collect-artifacts.js   Give release packages consistent names in dist/
tests/                        Browser and desktop export bridge regression tests
.github/workflows/pages.yml   Publish the website when main is updated
.github/workflows/release.yml Build Windows / macOS packages and publish v* tag releases
```
