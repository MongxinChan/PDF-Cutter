const { test, expect } = require("@playwright/test");
const { PDFDocument } = require("pdf-lib");
const JSZip = require("jszip");
const fs = require("node:fs/promises");

async function prepare(page, desktop = false) {
  // No CDN access: the staged release must work from local assets alone.
  await page.route("**/*", route => {
    if (new URL(route.request().url()).hostname === "127.0.0.1") return route.continue();
    return route.abort();
  });
  if (desktop) await page.addInitScript(() => {
    window.savedFiles = [];
    window.reveals = 0;
    window.failSave = false;
    window.failReveal = false;
    window.__TAURI__ = { core: { invoke: async (command, data, options) => {
      if (command === "save_file") {
        if (window.failSave) throw new Error("测试：磁盘写入失败");
        if (!(data instanceof Uint8Array)) throw new Error("必须使用原始二进制接口");
        window.savedFiles.push({ name: decodeURIComponent(options.headers["x-file-name"]), bytes: Array.from(data) });
      } else if (command === "reveal_saved_file") {
        window.reveals++;
        if (window.failReveal) throw new Error("测试：无法打开文件夹");
      } else throw new Error("未知桌面命令：" + command);
    } } };
  });
  await page.goto("/");
  await expect(page.locator("#libState")).toHaveText("PDF 处理组件已就绪。");
  const pdf = await PDFDocument.create();
  for (let i = 0; i < 5; i++) pdf.addPage([300 + i, 400]);
  await page.locator("#file").setInputFiles({ name: "测试.pdf", mimeType: "application/pdf", buffer: Buffer.from(await pdf.save()) });
  await expect(page.locator("#filePages")).toHaveText("5");
  await page.locator("#perPages").fill("2");
  await page.locator("#go").click();
  await expect(page.locator("#slips li")).toHaveCount(3);
}

test("离线网页仍能下载单份 PDF 和完整 ZIP", async ({ page }) => {
  await prepare(page);
  await expect(page.locator("html")).not.toHaveClass(/is-app/);
  const download = page.waitForEvent("download");
  await page.locator("#slips a").first().click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("测试_part01_p1-2.pdf");
  const result = await PDFDocument.load(await fs.readFile(await file.path()));
  expect(result.getPageCount()).toBe(2);
  expect(result.getPage(1).getWidth()).toBe(301);
  const zipDownload = page.waitForEvent("download");
  await page.locator("#zipAll").click();
  const zip = await JSZip.loadAsync(await fs.readFile(await (await zipDownload).path()));
  expect(Object.keys(zip.files)).toHaveLength(3);
});

test("桌面单份、批量和 ZIP 导出保留原始数据且每批只打开一次文件夹", async ({ page }) => {
  await prepare(page, true);
  await expect(page.locator("html")).toHaveClass("is-app");
  await page.locator("#slips a").first().click();
  await expect.poll(() => page.evaluate(() => window.reveals)).toBe(1);
  await page.locator("#dlAll").click();
  await expect.poll(() => page.evaluate(() => window.reveals)).toBe(2);
  let saved = await page.evaluate(() => window.savedFiles);
  expect(saved).toHaveLength(4);
  for (const [index, file] of saved.slice(1).entries()) {
    const pdf = await PDFDocument.load(Uint8Array.from(file.bytes));
    expect(pdf.getPageCount()).toBe(index === 2 ? 1 : 2);
    expect(pdf.getPage(0).getWidth()).toBe(300 + index * 2);
  }
  await page.locator("#zipAll").click();
  await expect.poll(() => page.evaluate(() => window.reveals)).toBe(3);
  saved = await page.evaluate(() => window.savedFiles);
  expect(saved[4].name).toBe("测试_切分.zip");
  const zip = await JSZip.loadAsync(Uint8Array.from(saved[4].bytes));
  expect(Object.keys(zip.files)).toHaveLength(3);
  await page.locator("#languageToggle").click();
  await expect(page.locator(".save-hint")).toContainText("Downloads / PDF裁纸台");
  await page.locator("#zipAll").click();
  await expect.poll(() => page.evaluate(() => window.reveals)).toBe(4);
  await expect(page.locator("#status")).toHaveText("Saved to “Downloads / PDF裁纸台”.");
  saved = await page.evaluate(() => window.savedFiles);
  expect(saved[5].name).toBe("测试_split.zip");
  expect(Object.keys((await JSZip.loadAsync(Uint8Array.from(saved[5].bytes))).files)).toHaveLength(3);
});

test("保存失败可重试，打开文件夹失败不会误报文件保存失败", async ({ page }) => {
  await prepare(page, true);
  await page.evaluate(() => { window.failSave = true; });
  await page.locator("#dlAll").click();
  await expect(page.locator("#status")).toContainText("导出失败");
  await expect(page.locator("#dlAll")).toBeEnabled();
  expect(await page.evaluate(() => window.reveals)).toBe(0);
  await page.evaluate(() => { window.failSave = false; window.failReveal = true; });
  await page.locator("#dlAll").click();
  await expect(page.locator("#status")).toContainText("文件已保存");
  await expect(page.locator("#status")).toContainText("未能打开文件夹");
  expect(await page.evaluate(() => window.savedFiles.length)).toBe(3);
});

test("自定义范围和按大小切分可通过桌面接口导出", async ({ page }) => {
  await prepare(page, true);
  await page.locator('label[for="m-ranges"]').click();
  await page.locator("#ranges").fill("2-3,5");
  await page.locator("#go").click();
  await expect(page.locator("#slips li")).toHaveCount(2);
  await page.locator("#dlAll").click();
  await expect.poll(() => page.evaluate(() => window.reveals)).toBe(1);
  const saved = await page.evaluate(() => window.savedFiles);
  expect((await PDFDocument.load(Uint8Array.from(saved[0].bytes))).getPage(0).getWidth()).toBe(301);
  await page.locator('label[for="m-size"]').click();
  await page.locator("#maxMB").fill("1");
  await page.locator("#maxPages").fill("2");
  await page.locator("#go").click();
  await expect(page.locator("#slips li")).toHaveCount(3);
});
