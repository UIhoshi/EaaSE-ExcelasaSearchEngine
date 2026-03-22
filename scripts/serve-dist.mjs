import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { URL, fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const distRoot = path.resolve(projectRoot, process.env.DIST_ROOT ?? "dist");
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? "4173");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

const networkAddresses = () => {
  if (host !== "0.0.0.0") {
    return [];
  }

  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const configs of Object.values(interfaces)) {
    for (const config of configs ?? []) {
      if (config.family === "IPv4" && !config.internal) {
        addresses.push(`http://${config.address}:${port}`);
      }
    }
  }

  return addresses;
};

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${host}:${port}`);
  const requestPath = requestUrl.pathname === "/" ? "/index.html" : decodeURIComponent(requestUrl.pathname);
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(distRoot, safePath);

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": contentTypes[ext] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(data);
  });
});

server.listen(port, host, () => {
  process.stdout.write(`Excel Strict Searcher is running at http://${host}:${port}\n`);

  for (const url of networkAddresses()) {
    process.stdout.write(`LAN access: ${url}\n`);
  }
});
