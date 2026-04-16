// read ../AGENTS.md and ../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
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
const releaseIndexUrl = "https://nodejs.org/dist/index.json";

const getLatestWindowsInstaller = async () => {
  const response = await fetch(releaseIndexUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch Node.js release index: ${response.status} ${response.statusText}`);
  }

  const releases = await response.json();
  const latestLts = releases.find((release) => Boolean(release.lts) && release.files.includes("win-x64-msi"));

  if (!latestLts) {
    throw new Error("No latest Node.js LTS Windows x64 MSI release was found.");
  }

  const version = latestLts.version.replace(/^v/, "");
  const fileName = `node-v${version}-x64.msi`;

  return {
    version,
    ltsName: latestLts.lts,
    fileName,
    homepage: "https://nodejs.org/en/download/",
    downloadUrl: `https://nodejs.org/dist/v${version}/${fileName}`,
  };
};

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
  const installer = await getLatestWindowsInstaller();

  await fs.mkdir(outputRoot, { recursive: true });
  await downloadToFile(installer.downloadUrl, path.join(outputRoot, installer.fileName));
  await fs.writeFile(
    path.join(outputRoot, "node-installer.json"),
    `${JSON.stringify({ ...installer, downloadedAt: new Date().toISOString() }, null, 2)}\n`,
    "utf8",
  );

  process.stdout.write(`Downloaded official Node.js installer: ${installer.fileName}\n`);
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
