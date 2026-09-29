// Renders build/icon.svg to build/icon.png (1024x1024).
// electron-builder turns icon.png into the macOS .icns and Windows .ico automatically.
"use strict";

const path = require("path");
const sharp = require("sharp");

const svg = path.join(__dirname, "..", "build", "icon.svg");
const png = path.join(__dirname, "..", "build", "icon.png");

sharp(svg, { density: 300 })
  .resize(1024, 1024)
  .png()
  .toFile(png)
  .then(() => console.log("[make-icon] build/icon.png"))
  .catch((err) => {
    console.error("[make-icon] 生成图标失败：", err.message);
    process.exit(1);
  });
