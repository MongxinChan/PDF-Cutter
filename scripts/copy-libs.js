// Copies the two browser libraries from node_modules into ./lib so the page
// (and the desktop app) can run fully offline. Runs automatically after `npm install`.
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const libDir = path.join(root, "lib");

const files = [
  ["pdf-lib/dist/pdf-lib.min.js", "pdf-lib.min.js"],
  ["jszip/dist/jszip.min.js", "jszip.min.js"]
];

fs.mkdirSync(libDir, { recursive: true });

let missing = 0;
for (const [from, to] of files) {
  const src = path.join(root, "node_modules", from);
  if (!fs.existsSync(src)) {
    console.warn(`[copy-libs] 找不到 ${src}，跳过`);
    missing += 1;
    continue;
  }
  fs.copyFileSync(src, path.join(libDir, to));
  console.log(`[copy-libs] lib/${to}`);
}

if (missing) process.exitCode = 0; // don't break `npm install`
