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

桌面版切好的文件会保存到“下载 / PDF裁纸台”文件夹。

## 第一次打开被拦截

这个 App 没有购买苹果和微软的开发者签名证书，所以系统第一次会提示风险。

**Windows** 出现“Windows 已保护你的电脑”：点“更多信息”，再点“仍要运行”。

**macOS** 提示“无法验证开发者”或“Apple 无法检查其是否包含恶意软件”：先点“完成”关掉提示，打开“系统设置 → 隐私与安全性”，往下找到这个 App 的提示，点“仍要打开”。较旧的 macOS 也可以在“应用程序”里右键点 App，选“打开”。

**macOS** 提示“已损坏，无法打开”：把 App 拖进“应用程序”文件夹后，打开“终端”，运行下面这行，然后再打开 App：

```bash
xattr -cr "/Applications/PDF 裁纸台.app"
```

## 本地开发

需要 Node.js 22.12 或更新版本。

```bash
npm install        # 同时会把 pdf-lib、JSZip 复制到 lib/，网页即可离线使用
npm start          # 启动桌面版
npm run dist       # 在本机打包当前系统的安装包，输出到 dist/
```

在国内下载 Electron 很慢时，可以先设置镜像再 `npm install`：

```bash
# Windows PowerShell
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
# macOS / Linux
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
```

## 项目结构

```
index.html                   网页本体（网页版和桌面版共用）
electron/main.js             桌面版外壳：窗口、下载保存位置
scripts/copy-libs.js         npm install 后把 pdf-lib / JSZip 复制到 lib/
scripts/make-icon.js         用 build/icon.svg 生成 App 图标
.github/workflows/pages.yml  推送到 main 后自动发布网页
.github/workflows/release.yml 推送 v 开头的标签后自动打包 Windows / macOS 并发布 Release
```

## 许可

MIT
