const { test, expect } = require("@playwright/test");
const { PDFDocument } = require("pdf-lib");
const JSZip = require("jszip");
const fs = require("node:fs/promises");

test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
});

async function openEnglish(page) {
  await page.goto("/?lang=en");
  await expect(page.locator("#libState")).toHaveText("PDF tools are ready.");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
}

async function choosePDF(page) {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < 5; i++) pdf.addPage([300 + i, 400]);
  await page.locator("#file").setInputFiles({name: "notes.pdf", mimeType: "application/pdf", buffer: Buffer.from(await pdf.save())});
  await expect(page.locator("#filePages")).toHaveText("5");
  await page.locator("#perPages").fill("2");
}

test("英文直达优先于语言偏好，切换后记忆偏好并保留其他 URL 参数", async ({ page }) => {
  await openEnglish(page);
  await expect(page).toHaveTitle("PDF Cutter — Free PDF Splitter");
  await expect(page.getByRole("region", {name: "Split settings"})).toBeVisible();
  await expect(page.locator("#go")).toHaveText("Start splitting");
  await page.locator("#languageToggle").click();
  await expect(page).toHaveURL(/lang=zh-CN/);
  await page.goto("/?lang=en&source=readme#preview");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.locator("#languageToggle").click();
  await page.locator("#languageToggle").click();
  await expect(page).toHaveURL(/lang=en&source=readme#preview$/);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/?lang=zh-CN");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
});

test("禁用本地存储时英文入口和切换仍然可用", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", {get() {throw new Error("Storage blocked");}}));
  await openEnglish(page);
  await page.locator("#languageToggle").click();
  await expect(page.locator("#go")).toHaveText("开始切分");
  await page.locator("#languageToggle").click();
  await choosePDF(page);
  await page.locator("#go").click();
  await expect(page.locator("#status")).toContainText("Done in");
});

test("切换保留文件设置和结果，复用下载地址且 PDF 与 ZIP 内容正确", async ({ page }) => {
  await openEnglish(page);
  await choosePDF(page);
  await page.locator("#languageToggle").click();
  await expect(page.locator("#perPages")).toHaveValue("2");
  await expect(page.locator("#fileName")).toHaveText("notes.pdf");
  await page.locator("#go").click();
  await expect(page.locator("#slips li")).toHaveCount(3);
  const urls = await page.locator("#slips a").evaluateAll(links => links.map(a => a.href));
  for (let i = 0; i < 5; i++) await page.locator("#languageToggle").click();
  await expect(page.locator("#matTitle")).toHaveText("Split results");
  await expect(page.locator("#summary")).toHaveText("Created 3 files");
  await expect(page.locator("#status")).toContainText("Done in");
  expect(await page.locator("#slips a").evaluateAll(links => links.map(a => a.href))).toEqual(urls);
  await expect(page.locator(".piece").first()).toHaveAttribute("title", "Part 1: pages 1–2 (2 pages)");
  const downloading = page.waitForEvent("download");
  await page.locator("#slips a").first().click();
  const pdf = await PDFDocument.load(await fs.readFile(await (await downloading).path()));
  expect(pdf.getPageCount()).toBe(2);
  expect(pdf.getPage(1).getWidth()).toBe(301);
  const zipping = page.waitForEvent("download");
  await page.locator("#zipAll").click();
  const download = await zipping;
  expect(download.suggestedFilename()).toBe("notes_split.zip");
  const zip = await JSZip.loadAsync(await fs.readFile(await download.path()));
  expect(Object.keys(zip.files)).toHaveLength(3);
  await expect(page.locator("#status")).toHaveText("Downloads started.");
});

test("范围错误、大小警告和手机布局支持英文", async ({ page }) => {
  await page.setViewportSize({width: 360, height: 800});
  await openEnglish(page);
  await choosePDF(page);
  await page.locator('label[for="m-ranges"]').click();
  await page.locator("#ranges").fill("9-10");
  await expect(page.locator("#status")).toHaveText("“9-10” exceeds the document’s 5 pages.");
  await expect(page.locator("#go")).toBeDisabled();
  await page.locator("#languageToggle").click();
  await expect(page.locator("#status")).toHaveText("“9-10” 超出了总页数 5");
  await page.locator("#languageToggle").click();
  await page.locator("#ranges").fill("2-3,5");
  await page.locator("#go").click();
  await expect(page.locator("#slips li")).toHaveCount(2);
  await page.locator('label[for="m-size"]').click();
  await page.locator("#maxMB").fill("0.0001");
  await page.locator("#go").click();
  await expect(page.locator("#slips li")).toHaveCount(5);
  await expect(page.locator(".warn").first()).toHaveText("Single page exceeds size limit");
  await expect(page.locator("#status")).toContainText("5 files exceed");
  for (const width of [360, 320]) {
    await page.setViewportSize({width, height: 800});
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test("切分进行中可切换语言，后续进度和结果使用所选语言", async ({ page }) => {
  await openEnglish(page);
  await choosePDF(page);
  await page.evaluate(() => {
    const create = PDFLib.PDFDocument.create;
    PDFLib.PDFDocument.create = async (...args) => {
      await new Promise(resolve => { window.continueSplit = resolve; });
      PDFLib.PDFDocument.create = create;
      return create(...args);
    };
  });
  await page.locator("#go").click();
  await expect(page.locator("#status")).toHaveText("Splitting file 1 of 3…");
  await page.locator("#languageToggle").click();
  await expect(page.locator("#status")).toHaveText("正在切第 1 / 3 份…");
  await page.waitForFunction(() => !!window.continueSplit);
  await page.evaluate(() => window.continueSplit());
  await expect(page.locator("#slips li")).toHaveCount(3);
  await expect(page.locator("#status")).toContainText("切好了");
  await page.locator("#languageToggle").click();
  await expect(page.locator("#status")).toContainText("Done in");
});
