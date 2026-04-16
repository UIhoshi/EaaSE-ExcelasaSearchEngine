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

const read = async (relativePath) => fs.readFile(path.join(projectRoot, relativePath), "utf8");

const expectIncludes = async (relativePath, expectedTexts) => {
  const content = await read(relativePath);

  for (const expectedText of expectedTexts) {
    if (!content.includes(expectedText)) {
      throw new Error(`Missing expected doc text in ${relativePath}: ${expectedText}`);
    }
  }
};

const expectExcludes = async (relativePath, forbiddenTexts) => {
  const content = await read(relativePath);

  for (const forbiddenText of forbiddenTexts) {
    if (content.includes(forbiddenText)) {
      throw new Error(`Forbidden doc text remains in ${relativePath}: ${forbiddenText}`);
    }
  }
};

const main = async () => {
  await expectIncludes("README.md", [
    "## Logic Entry",
    "AgentLogic/00_README.md",
    "npm run check:logic",
    "npm run check:docs",
  ]);

  await expectIncludes("PROJECT_FACT_MAP.md", [
    "## 1. Project Identity",
    "## 3. Logic Entry",
    "AgentLogic/AgentLogic_V6.md",
  ]);

  await expectExcludes("PROJECT_FACT_MAP.md", [
    "## 4. 当前任务目标",
    "当前任务描述",
    "当前任务类型",
    "当前任务完成标准",
  ]);

  await expectIncludes("APP_EXECUTION_FLOW.md", [
    "## 2. Startup Flow",
    "## 4. Search Flow",
    "useWorkbookArchive",
    "Worker",
  ]);

  const projectDocs = [
    "README.md",
    "README.zh-CN.md",
    "README.ja.md",
    "PROJECT_FACT_MAP.md",
    "TECHNICAL_SPEC.md",
    "REQUIREMENTS.md",
    "AGENTLOGIC_EAASE_MAPPING.md",
    "AI_SESSION_QUICKSTART.md",
    "AI_SESSION_OPENING_TEMPLATE.md",
    "BUILD_RELEASE_REQUIREMENTS.md",
    "VERSION_BUMP_CHECKLIST.md",
  ];

  for (const docPath of projectDocs) {
    await expectExcludes(docPath, ["AgentLogic_V6/"]);
  }

  process.stdout.write("Document checks passed.\n");
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
