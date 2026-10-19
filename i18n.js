(function () {
  "use strict";
  const messages = {
  "brand": {
    "zh-CN": "裁纸台",
    "en": " Cutter"
  },
  "intro": {
    "zh-CN": "把大 PDF 切成几份小文件，方便分批上传给 Claude。",
    "en": "Split large PDFs into smaller files for easy sharing and uploading to Claude. "
  },
  "privacyWeb": {
    "zh-CN": "文件只在你的浏览器里处理，不会上传到任何服务器。",
    "en": "Your files stay in your browser and are never uploaded to a server."
  },
  "privacyApp": {
    "zh-CN": "文件只在这台电脑上处理，不会上传。",
    "en": "Your files are processed on this computer and never uploaded."
  },
  "desktop": {
    "zh-CN": "下载桌面版（Windows / macOS）",
    "en": "Download for Windows / macOS"
  },
  "choose": {
    "zh-CN": "选择 PDF 文件",
    "en": "Choose a PDF"
  },
  "drop": {
    "zh-CN": "点击这里，或把文件拖进来",
    "en": "Click here or drag and drop a file"
  },
  "pages": {
    "zh-CN": "页",
    "en": "Pages"
  },
  "size": {
    "zh-CN": "大小",
    "en": "Size"
  },
  "byPages": {
    "zh-CN": "按页数",
    "en": "Page count"
  },
  "bySize": {
    "zh-CN": "按大小",
    "en": "File size"
  },
  "byRanges": {
    "zh-CN": "自定义范围",
    "en": "Page ranges"
  },
  "perPages": {
    "zh-CN": "每份多少页",
    "en": "Pages per file"
  },
  "pagesHint": {
    "zh-CN": "最后一份可能少于这个页数。",
    "en": "The last file may contain fewer pages."
  },
  "maxMB": {
    "zh-CN": "每份不超过（MB）",
    "en": "Maximum file size (MB)"
  },
  "maxPages": {
    "zh-CN": "每份最多页数（留空表示不限）",
    "en": "Maximum pages per file (blank for no limit)"
  },
  "preset": {
    "zh-CN": "使用 Claude 常用上限：30 MB、100 页",
    "en": "Claude preset: 30 MB, 100 pages"
  },
  "sizeHint": {
    "zh-CN": "会实际试切来确认每份大小，页数多的文件需要多等一会儿。单页本身就超过上限时，这一页会单独成一份。",
    "en": "Checks the actual size of each output file. Large documents may take longer. If a single page exceeds the limit, it becomes a separate file."
  },
  "ranges": {
    "zh-CN": "页码范围，用逗号分隔",
    "en": "Page ranges, separated by commas"
  },
  "rangesHint": {
    "zh-CN": "“46-” 表示从第 46 页到最后一页；单独写 “7” 表示只要第 7 页。每个范围生成一份文件。",
    "en": "“46-” means page 46 to the end; “7” extracts only page 7. Each range creates one file."
  },
  "split": {
    "zh-CN": "开始切分",
    "en": "Start splitting"
  },
  "preview": {
    "zh-CN": "切分预览",
    "en": "Split preview"
  },
  "empty": {
    "zh-CN": "选好 PDF 后，这里会显示每一份包含哪些页。",
    "en": "Choose a PDF to preview the pages in each output file."
  },
  "files": {
    "zh-CN": "切好的文件",
    "en": "Your split files"
  },
  "zip": {
    "zh-CN": "打包下载 ZIP",
    "en": "Download ZIP"
  },
  "downloadAll": {
    "zh-CN": "逐个下载全部",
    "en": "Download all files"
  },
  "saveHint": {
    "zh-CN": "点“下载”后文件会保存到电脑的“下载 / PDF裁纸台”文件夹，并自动打开这个文件夹。",
    "en": "Downloads are saved to “Downloads / PDF裁纸台”. The folder opens automatically after saving."
  },
  "loading": {
    "zh-CN": "正在加载 PDF 处理组件…",
    "en": "Loading PDF tools…"
  },
  "offline": {
    "zh-CN": "离线使用：把 pdf-lib.min.js 和 jszip.min.js 放进本页面旁边的 lib 文件夹，页面会优先使用本地文件。",
    "en": "For offline use, place pdf-lib.min.js and jszip.min.js in a lib folder next to this page. Local libraries are loaded first."
  },
  "claudeHint": {
    "zh-CN": "Claude 的上传限制可能会调整，以你上传时的提示为准；超过 100 页的 PDF，Claude 可能只读取文字而不看图表。",
    "en": "Claude’s upload limits may change; check the limits shown when uploading. For PDFs over 100 pages, Claude may read only the text, without charts or images."
  },
  "settings": {
    "zh-CN": "切分设置",
    "en": "Split settings"
  },
  "mode": {
    "zh-CN": "切分方式",
    "en": "Splitting mode"
  },
  "previewRegion": {
    "zh-CN": "切分预览与结果",
    "en": "Split preview and results"
  },
  "ready": {
    "zh-CN": "PDF 处理组件已就绪。",
    "en": "PDF tools are ready."
  },
  "loadFailed": {
    "zh-CN": "PDF 处理组件加载失败：请检查网络后刷新，或按下面的方法放入本地 lib 文件。",
    "en": "PDF tools could not load. Check your connection and reload, or add the local libraries as described below."
  },
  "pdfUnavailable": {
    "zh-CN": "PDF 处理组件没加载成功，暂时无法打开文件。",
    "en": "PDF tools could not load, so the file cannot be opened yet."
  },
  "zipUnavailable": {
    "zh-CN": "ZIP 组件没加载成功，请用“逐个下载全部”",
    "en": "ZIP tools could not load. Use “Download all files” instead."
  },
  "rangeRequired": {
    "zh-CN": "请填写至少一个页码范围，例如 1-20",
    "en": "Enter at least one page range, such as 1-20."
  },
  "rangeInvalid": {
    "zh-CN": "看不懂 “{range}”，请写成 1-20 这样的格式",
    "en": "Cannot read “{range}”. Use a format such as 1-20."
  },
  "rangeZero": {
    "zh-CN": "页码从 1 开始：“{range}”",
    "en": "Page numbers start at 1: “{range}”."
  },
  "rangeBeyond": {
    "zh-CN": "“{range}” 超出了总页数 {total}",
    "en": "“{range}” exceeds the document’s {total} pages."
  },
  "rangeReversed": {
    "zh-CN": "“{range}” 的起始页大于结束页",
    "en": "The start page is greater than the end page in “{range}”."
  },
  "pagesInvalid": {
    "zh-CN": "每份页数需要是大于 0 的整数",
    "en": "Pages per file must be a positive whole number."
  },
  "sizeInvalid": {
    "zh-CN": "请填写每份的大小上限（MB）",
    "en": "Enter a positive maximum file size in MB."
  },
  "maxPagesInvalid": {
    "zh-CN": "每份最多页数需要是大于 0 的整数，或留空",
    "en": "Maximum pages must be a positive whole number, or left blank."
  },
  "piece": {
    "zh-CN": "第 {part} 份：第 {start}–{end} 页，共 {count} 页",
    "en": "Part {part}: pages {start}–{end} ({count} pages)"
  },
  "estimated": {
    "zh-CN": "估计切成 {count} 份",
    "en": "Estimated: {count} files"
  },
  "planned": {
    "zh-CN": "将切成 {count} 份",
    "en": "Will create {count} files"
  },
  "finished": {
    "zh-CN": "已切成 {count} 份",
    "en": "Created {count} files"
  },
  "oversize": {
    "zh-CN": "单页已超过大小上限",
    "en": "Single page exceeds size limit"
  },
  "overMB": {
    "zh-CN": "超过 30 MB",
    "en": "Over 30 MB"
  },
  "overPages": {
    "zh-CN": "超过 100 页",
    "en": "Over 100 pages"
  },
  "download": {
    "zh-CN": "下载",
    "en": "Download"
  },
  "results": {
    "zh-CN": "切分结果",
    "en": "Split results"
  },
  "pageRange": {
    "zh-CN": "第 {start}–{end} 页",
    "en": "Pages {start}–{end}"
  },
  "fileStats": {
    "zh-CN": "{count} 页  {size}",
    "en": "{count} pages · {size}"
  },
  "notPDF": {
    "zh-CN": "这不是 PDF 文件，请重新选择。",
    "en": "This is not a PDF file. Please choose another file."
  },
  "pending": {
    "zh-CN": "组件还在加载，加载完成后会自动打开这个文件…",
    "en": "Tools are still loading. Your file will open automatically when they are ready…"
  },
  "encrypted": {
    "zh-CN": "这个 PDF 有加密保护，切出来的文件可能打不开或内容空白。建议先去掉密码再切分。",
    "en": "This PDF is encrypted. Split files may be blank or fail to open. Remove the password before splitting."
  },
  "changePDF": {
    "zh-CN": "换一个 PDF",
    "en": "Choose another PDF"
  },
  "reading": {
    "zh-CN": "正在读取 {name} …",
    "en": "Reading {name}…"
  },
  "readError": {
    "zh-CN": "读取失败：文件可能已损坏或不是标准 PDF（{error}）",
    "en": "Could not read the file. It may be damaged or not a valid PDF ({error})."
  },
  "splitting": {
    "zh-CN": "正在切第 {part} / {total} 份…",
    "en": "Splitting file {part} of {total}…"
  },
  "trying": {
    "zh-CN": "正在试切第 {part} 份（已完成 {done} / {total} 页）…",
    "en": "Sizing file {part} ({done} of {total} pages complete)…"
  },
  "splitError": {
    "zh-CN": "切分出错：{error}",
    "en": "Splitting failed: {error}"
  },
  "revealError": {
    "zh-CN": "文件已保存到“下载 / PDF裁纸台”，但未能打开文件夹：{error}",
    "en": "Files were saved to “Downloads / PDF裁纸台”, but the folder could not be opened: {error}"
  },
  "exportError": {
    "zh-CN": "导出失败：{error}。已保存的文件仍在下载文件夹，可以重试。",
    "en": "Export failed: {error}. Any files already saved remain in your downloads folder. You can retry."
  },
  "done": {
    "zh-CN": "切好了，用时 {seconds} 秒。",
    "en": "Done in {seconds} seconds."
  },
  "doneWarning": {
    "zh-CN": "有 {count} 份超过了 Claude 的常用上限，已用红框标出。",
    "en": " {count} files exceed Claude’s common limits and are outlined in red."
  },
  "saving": {
    "zh-CN": "正在保存文件…",
    "en": "Saving files…"
  },
  "downloading": {
    "zh-CN": "正在准备下载…",
    "en": "Preparing downloads…"
  },
  "saved": {
    "zh-CN": "已保存到“下载 / PDF裁纸台”。",
    "en": "Saved to “Downloads / PDF裁纸台”."
  },
  "downloaded": {
    "zh-CN": "已发起下载。",
    "en": "Downloads started."
  },
  "zipSuffix": {
    "zh-CN": "_切分.zip",
    "en": "_split.zip"
  }
};

  function normalize(value) {
    if (value === "en") return "en";
    if (value === "zh" || value === "zh-CN") return "zh-CN";
    return null;
  }
  let saved = null;
  try { saved = localStorage.getItem("pdf-cutter-language"); } catch (_) { /* Storage is optional. */ }
  let language = normalize(new URLSearchParams(location.search).get("lang")) || normalize(saved) || "zh-CN";
  function t(key, values) {
    return messages[key][language].replace(/\{(\w+)\}/g, function (_, name) {
      return values && values[name] !== undefined ? String(values[name]) : "{" + name + "}";
    });
  }
  function message(key, values) { return function () { return t(key, values); }; }
  function setLanguage(value) {
    language = normalize(value) || "zh-CN";
    try { localStorage.setItem("pdf-cutter-language", language); } catch (_) { /* Private or file mode. */ }
    try {
      const url = new URL(location.href);
      url.searchParams.set("lang", language);
      history.replaceState(null, "", url);
    } catch (_) { /* Some local WebViews cannot replace their URL. */ }
  }
  function applyLanguage() {
    document.documentElement.lang = language;
    document.title = language === "en" ? "PDF Cutter — Free PDF Splitter" : "PDF 裁纸台";
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    const toggle = document.getElementById("languageToggle");
    toggle.textContent = language === "en" ? "简体中文" : "English";
    toggle.lang = language === "en" ? "zh-CN" : "en";
    toggle.setAttribute("aria-label", language === "en" ? "切换到简体中文" : "Switch to English");
  }
  window.pdfI18n = { t, message, setLanguage, applyLanguage };
})();
