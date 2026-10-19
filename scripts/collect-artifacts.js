"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { version } = require("../package.json");
const root = path.join(__dirname, "..");
const output = path.join(root, "dist");
const target = process.env.CARGO_BUILD_TARGET;
const release = path.join(root, "src-tauri", "target", ...(target ? [target] : []), "release");
fs.mkdirSync(output, { recursive: true });

function copy(source, name) {
  const destination = path.join(output, name);
  fs.copyFileSync(source, destination);
  console.log(`[dist] ${name}: ${(fs.statSync(destination).size / 1024 / 1024).toFixed(2)} MiB`);
}
function findBundle(folder, extension) {
  const files = fs.readdirSync(folder).filter(name => name.includes(`_${version}_`) && name.endsWith(extension));
  if (files.length !== 1) throw new Error(`期望 ${folder} 内有一个 ${version} 版本的 ${extension} 安装包，实际为 ${files.length} 个。`);
  return path.join(folder, files[0]);
}
if (process.platform === "win32") {
  copy(findBundle(path.join(release, "bundle", "nsis"), ".exe"), `pdf-cutter-${version}-windows-setup.exe`);
  copy(path.join(release, "pdf-cutter.exe"), `pdf-cutter-${version}-windows-portable.exe`);
} else if (process.platform === "darwin") {
  const arch = target ? (target.startsWith("aarch64") ? "arm64" : "x64") : process.arch;
  copy(findBundle(path.join(release, "bundle", "dmg"), ".dmg"), `pdf-cutter-${version}-mac-${arch}.dmg`);
} else {
  throw new Error("当前发布脚本支持 Windows 和 macOS。");
}
