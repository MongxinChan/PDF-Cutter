"use strict";

// Desktop shell for PDF 裁纸台: opens index.html in a window and saves
// downloads straight into  Downloads/PDF裁纸台  instead of asking every time.

const { app, BrowserWindow, shell, session } = require("electron");
const path = require("path");
const fs = require("fs");

const SAVE_DIR_NAME = "PDF裁纸台";
let win = null;

function isWebUrl(url) {
  return /^https?:\/\//i.test(url || "");
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 420,
    minHeight: 560,
    backgroundColor: "#F3F5F1",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.once("ready-to-show", () => win.show());
  win.loadFile(path.join(__dirname, "..", "index.html"));

  // Links that try to open a new window go to the system browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isWebUrl(url)) shell.openExternal(url);
    return { action: "deny" };
  });

  // Never navigate the app window away from the tool itself
  // (e.g. when a PDF is dropped outside the drop area).
  win.webContents.on("will-navigate", (event, url) => {
    const target = url || (event && event.url);
    if (target && target !== win.webContents.getURL()) {
      event.preventDefault();
      if (isWebUrl(target)) shell.openExternal(target);
    }
  });

  win.on("closed", () => { win = null; });
}

/* ---------- downloads ---------- */

const reserved = new Set();
let revealTimer = null;
let lastSaved = null;

function safeName(name) {
  const cleaned = String(name || "").replace(/[\\/:*?"<>|]+/g, "_").trim();
  return cleaned || "download.pdf";
}

function uniquePath(dir, name) {
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  let candidate = path.join(dir, name);
  let i = 1;
  while (fs.existsSync(candidate) || reserved.has(candidate)) {
    candidate = path.join(dir, `${base} (${i})${ext}`);
    i += 1;
  }
  return candidate;
}

function setupDownloads() {
  session.defaultSession.on("will-download", (_event, item) => {
    const dir = path.join(app.getPath("downloads"), SAVE_DIR_NAME);
    fs.mkdirSync(dir, { recursive: true });

    const target = uniquePath(dir, safeName(item.getFilename()));
    reserved.add(target);
    item.setSavePath(target);

    item.once("done", (_e, state) => {
      reserved.delete(target);
      if (state !== "completed") return;
      // A batch of downloads opens the folder only once, after the last file.
      lastSaved = target;
      clearTimeout(revealTimer);
      revealTimer = setTimeout(() => {
        if (lastSaved) shell.showItemInFolder(lastSaved);
        lastSaved = null;
      }, 900);
    });
  });
}

/* ---------- app lifecycle ---------- */

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });

  app.whenReady().then(() => {
    setupDownloads();
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
