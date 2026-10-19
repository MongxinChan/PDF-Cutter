(function () {
  "use strict";
  const invoke = window.__TAURI__ && window.__TAURI__.core.invoke;
  const isDesktop = typeof invoke === "function";
  if (isDesktop) document.documentElement.classList.add("is-app");

  window.pdfDesktop = {
    isDesktop: isDesktop,
    async save(bytes, name) {
      if (!isDesktop) throw new Error("桌面保存接口不可用。");
      // Raw IPC avoids expanding large PDFs into Base64 or JSON number arrays.
      const data = bytes instanceof Blob ? new Uint8Array(await bytes.arrayBuffer()) : bytes;
      await invoke("save_file", data, { headers: { "x-file-name": encodeURIComponent(name) } });
    },
    async reveal() {
      if (isDesktop) await invoke("reveal_saved_file");
    }
  };
})();
