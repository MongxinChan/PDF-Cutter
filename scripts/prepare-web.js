"use strict";

const fs = require("node:fs");
const path = require("node:path");
require("./copy-libs.js");

// Only this explicit asset list is embedded in the desktop executable.
const root = path.join(__dirname, "..");
const output = path.join(root, "web-dist");
fs.rmSync(output, { recursive: true, force: true });
for (const file of ["index.html", "desktop.js", "lib/pdf-lib.min.js", "lib/jszip.min.js", "build/icon.svg"]) {
  const target = path.join(output, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, file), target);
}
console.log("[prepare-web] 已准备离线网页资源：web-dist/");
