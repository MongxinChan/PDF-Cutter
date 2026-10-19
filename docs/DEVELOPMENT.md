# 开发与构建

**简体中文** | [English](DEVELOPMENT.en.md)

[返回项目介绍](../README.md)

建议使用 Node.js 24 LTS，并安装 [Rust stable](https://rustup.rs/)。平台构建依赖见 [Tauri 前置要求](https://v2.tauri.app/start/prerequisites/)：

- Windows：Visual Studio Build Tools 的“使用 C++ 的桌面开发”（MSVC、Windows SDK），以及 WebView2。
- macOS：Xcode Command Line Tools；DMG 需在 macOS 上构建。

以下命令在项目根目录执行。

```bash
npm install        # 同时会把 pdf-lib、JSZip 复制到 lib/，网页即可离线使用
npm start          # 启动桌面版
npm run dist       # 在本机打包当前系统的安装包，输出到 dist/
```

已有锁文件的环境使用 `npm ci`。桌面构建先把明确列出的网页资源复制到 `web-dist/`，再嵌入可执行文件，不会打入源代码、测试、node_modules 或编译工具链。

构建命令：

```bash
npm run dist:win   # 在 Windows 上生成 NSIS 安装包及独立 EXE
npm run dist:mac   # 在 macOS 上生成当前架构的 DMG
npm run prepare:web  # 只组装离线网页；可直接打开 web-dist/index.html
```

Windows 安装包使用 LZMA 压缩，Rust 发布构建启用 LTO、符号剥离和体积优化。GitHub Actions 分别在 Windows x64、macOS ARM64 和 macOS x64 上构建。首次编译会下载 Rust 依赖，耗时较长。

验证命令：

```bash
npx playwright install chromium
npm test
npm run icon
npm run prepare:web
cargo test --locked --manifest-path src-tauri/Cargo.toml
```

网页测试在禁用外网资源的条件下验证三种切分方式、PDF/ZIP 导出与桌面保存失败恢复。桌面接口在浏览器测试中使用模拟实现；Rust 测试验证文件名限制和并发重名保护，实际 WebView 行为仍需在目标系统验收。

## 项目结构

```
index.html                   网页本体（网页版和桌面版共用）
desktop.js                   Tauri 二进制保存接口及环境识别
src-tauri/src/               桌面入口、原生文件保存和重名保护
src-tauri/tauri.conf.json     窗口、资源、安全和安装包配置
scripts/copy-libs.js         npm install 后把 pdf-lib / JSZip 复制到 lib/
scripts/prepare-web.js       组装仅含必要资源的离线网页
scripts/collect-artifacts.js 统一安装包名称，输出到 dist/
tests/                      网页和桌面导出接口回归测试
.github/workflows/pages.yml  推送到 main 后自动发布网页
.github/workflows/release.yml 推送 v 开头的标签后自动打包 Windows / macOS 并发布 Release
```
