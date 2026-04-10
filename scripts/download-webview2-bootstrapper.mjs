import fs from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const outputRoot =
  process.argv[2] && process.argv[2].trim()
    ? path.resolve(projectRoot, process.argv[2])
    : path.join(projectRoot, "artifacts", "windows-portable-exe", "prereqs", "windows");
const downloadUrl = "https://go.microsoft.com/fwlink/p/?linkid=2124703";
const fileName = "MicrosoftEdgeWebView2Setup.exe";

const downloadToFile = async (url, destinationPath) => {
  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  const output = await fs.open(destinationPath, "w");

  try {
    await pipeline(response.body, output.createWriteStream());
  } finally {
    await output.close();
  }
};

const main = async () => {
  await fs.mkdir(outputRoot, { recursive: true });
  await downloadToFile(downloadUrl, path.join(outputRoot, fileName));
  await fs.writeFile(
    path.join(outputRoot, "webview2-installer.json"),
    `${JSON.stringify({ fileName, downloadUrl, downloadedAt: new Date().toISOString() }, null, 2)}\n`,
    "utf8",
  );

  process.stdout.write(`Downloaded official WebView2 bootstrapper: ${fileName}\n`);
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
