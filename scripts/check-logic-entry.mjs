// read ../AGENTS.md and ../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

const requiredPaths = [
  "AGENTS.md",
  "README.md",
  "AgentLogic/00_README.md",
  "AgentLogic/01_MasterLogic.md",
  "AgentLogic/15_LogicEntryChecklist.md",
  "AgentLogic/16_HeaderRuleTemplate.md",
  "PROJECT_FACT_MAP.md",
];

const docChecks = [
  {
    file: "README.md",
    includes: ["AgentLogic/00_README.md", "npm run check:logic"],
  },
  {
    file: "PROJECT_FACT_MAP.md",
    includes: ["AgentLogic/AgentLogic_V6.md", "## 1. Project Identity"],
  },
  {
    file: "AGENTS.md",
    includes: ["AgentLogic/01_MasterLogic.md", "AgentLogic/15_LogicEntryChecklist.md"],
  },
];

const entryExtensions = new Set([".ts", ".tsx", ".css", ".mjs", ".cs", ".csproj"]);

const headerCoreLines = [
  "then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.",
  "Before a new coding round, ask whether it extends the previous coding;",
  "if not, ask whether to forget/compress context first.",
  "Do not continue reading past this point until the loop above has been completed",
];

const headerRoots = [
  { dir: "src", prefix: "src" },
  { dir: "scripts", prefix: "scripts" },
];

const assertExists = async (relativePath) => {
  try {
    await fs.access(path.join(projectRoot, relativePath));
  } catch {
    throw new Error(`Missing required logic-entry path: ${relativePath}`);
  }
};

const assertIncludes = async (relativePath, expectedTexts) => {
  const content = await fs.readFile(path.join(projectRoot, relativePath), "utf8");

  for (const expectedText of expectedTexts) {
    if (!content.includes(expectedText)) {
      throw new Error(`Missing expected text in ${relativePath}: ${expectedText}`);
    }
  }
};

const collectEntryFiles = async (relativeDir) => {
  const absoluteDir = path.join(projectRoot, relativeDir);
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectEntryFiles(relativePath)));
      continue;
    }

    if (entryExtensions.has(path.extname(entry.name))) {
      files.push(relativePath);
    }
  }

  return files;
};

const toPosix = (relativePath) => relativePath.split(path.sep).join("/");

const expectedRelativePrefix = (relativePath) => {
  const normalized = toPosix(relativePath);
  const segments = normalized.split("/");
  const depth = Math.max(segments.length - 1, 1);
  return "../".repeat(depth);
};

const assertHeader = async (relativePath) => {
  const content = await fs.readFile(path.join(projectRoot, relativePath), "utf8");
  const firstLines = content.split(/\r?\n/, 8).join("\n");
  const relativePrefix = expectedRelativePrefix(relativePath);

  if (!firstLines.includes(`read ${relativePrefix}AGENTS.md and ${relativePrefix}README.md before editing this file;`)) {
    throw new Error(`Missing canonical header line 1 in ${relativePath}`);
  }

  for (const expectedLine of headerCoreLines) {
    if (!firstLines.includes(expectedLine)) {
      throw new Error(`Missing canonical header line in ${relativePath}: ${expectedLine}`);
    }
  }
};

const main = async () => {
  for (const requiredPath of requiredPaths) {
    await assertExists(requiredPath);
  }

  for (const docCheck of docChecks) {
    await assertIncludes(docCheck.file, docCheck.includes);
  }

  const entryFiles = [];
  for (const root of headerRoots) {
    entryFiles.push(...(await collectEntryFiles(root.dir)));
  }

  for (const entryFile of entryFiles) {
    await assertHeader(entryFile);
  }

  process.stdout.write(`Logic entry checks passed for ${entryFiles.length} files.\n`);
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
