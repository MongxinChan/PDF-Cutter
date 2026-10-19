const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../web-dist");
http.createServer((request, response) => {
  const file = path.resolve(root, "." + (request.url === "/" ? "/index.html" : request.url.split("?")[0]));
  if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, bytes) => {
    if (error) { response.writeHead(404).end(); return; }
    response.setHeader("Content-Type", ({ ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".svg": "image/svg+xml" })[path.extname(file)] || "application/octet-stream");
    response.end(bytes);
  });
}).listen(4173, "127.0.0.1");
