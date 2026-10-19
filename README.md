# PDF 裁纸台

把大 PDF 切成几份小文件，方便分批上传给 Claude（或其他有文件大小、页数限制的地方）。

文件只在你自己的电脑上处理，不会上传到任何服务器。

## 能做什么

- **按页数切：** 例如每 50 页一份。
- **按大小切：** 每份不超过指定 MB，还可以同时限制每份最多多少页。一键套用 Claude 常用上限（30 MB、100 页）。
- **自定义范围：** 例如 `1-20, 21-45, 46-`，每个范围一份。
- 切之前可以预览每一份包含哪些页；切完后可以单个下载、逐个下载全部，或打包成 ZIP。

## 怎么用

**网页版：** 直接打开 GitHub Pages 上的网页即可（地址见仓库右侧 About 栏）。

**桌面版：** 到 [Releases](../../releases/latest) 下载：

| 系统 | 下载的文件 |
| --- | --- |
| Windows | `pdf-cutter-…-windows-setup.exe`（安装版）或 `…-windows-portable.exe`（免安装） |
| macOS，Apple 芯片（M1 及以后） | `pdf-cutter-…-mac-arm64.dmg` |
| macOS，Intel 芯片 | `pdf-cutter-…-mac-x64.dmg` |

桌面版使用 **Tauri 2 + 系统 WebView**，不再随应用分发 Chromium 和 Node.js。网页和桌面版共用同一套 PDF 切分逻辑，桌面版内置全部网页组件，可离线处理文件。

切好的文件会保存到“下载 / PDF裁纸台”文件夹，同名文件自动添加编号，不覆盖已有文件；一次批量导出结束后打开一次文件夹。

**Windows 需要 Microsoft Edge WebView2 Runtime。** 安装版检测到缺失时会联网下载；免安装版要求电脑已经安装 WebView2。应用包不附带完整运行时，所以“免安装”不代表能在缺少运行时的电脑上直接运行。macOS 使用系统 WKWebView。

## 第一次打开被拦截

这个 App 没有购买苹果和微软的开发者签名证书，所以系统第一次会提示风险。

**Windows** 出现“Windows 已保护你的电脑”：点“更多信息”，再点“仍要运行”。

**macOS** 提示“无法验证开发者”或“Apple 无法检查其是否包含恶意软件”：先点“完成”关掉提示，打开“系统设置 → 隐私与安全性”，往下找到这个 App 的提示，点“仍要打开”。较旧的 macOS 也可以在“应用程序”里右键点 App，选“打开”。

**macOS** 提示“已损坏，无法打开”：把 App 拖进“应用程序”文件夹后，打开“终端”，运行下面这行，然后再打开 App：

```bash
xattr -cr "/Applications/PDF 裁纸台.app"
```

## 本地开发

建议使用 Node.js 24 LTS，并安装 [Rust stable](https://rustup.rs/)。平台构建依赖见 [Tauri 前置要求](https://v2.tauri.app/start/prerequisites/)：

- Windows：Visual Studio Build Tools 的“使用 C++ 的桌面开发”（MSVC、Windows SDK），以及 WebView2。
- macOS：Xcode Command Line Tools；DMG 需在 macOS 上构建。

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

## 许可

MIT
