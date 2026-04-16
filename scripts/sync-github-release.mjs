import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildRuntimeServer } from "./build-runtime-server.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const packageJson = JSON.parse(await fs.readFile(path.join(projectRoot, "package.json"), "utf8"));
const version = packageJson.version;
const artifactsRoot = path.join(projectRoot, "artifacts");
const githubRoot = path.join(projectRoot, "github");
const windowsPortableExe = path.join(artifactsRoot, "windows-portable-exe");
const windowsPortableRuntime = path.join(artifactsRoot, "windows-portable-runtime");
const windowsInstallerRelease = path.join(projectRoot, "windows-installer-release");
const tempRoot = path.join(projectRoot, ".release-temp");

const excludedSourceEntries = new Set([
  "node_modules",
  "artifacts",
  "github",
  "dist",
  "config",
  "AgentLogic_V6",
  "EaaSE-sync",
  "handle_tool",
  ".git",
  ".release-temp",
  "tmp-cache-check",
  "version-backups",
  "windows-installer-release",
]);

const excludedSourceFiles = new Set([
  "agentlogic.md",
  "AGENTLOGIC_EAASE_MAPPING.md",
  "AI_SESSION_OPENING_TEMPLATE.md",
  "AI_SESSION_QUICKSTART.md",
  "AgentLogic_V5.md",
  "BUILD_RELEASE_REQUIREMENTS.md",
  "handle.zip",
  "PLAN_ENHANCEMENT_V1.1.0.md",
  "PROJECT_FACT_MAP.md",
  "REQUIREMENTS.md",
  "TECHNICAL_SPEC.md",
  "tsconfig.app.tsbuildinfo",
  "UI_UX_SPEC.md",
  "VERSION_BUMP_CHECKLIST.md",
]);

const shouldSkipSourcePath = (relativePath, entry) => {
  const normalizedPath = relativePath.split(path.sep).join("/");
  const segments = normalizedPath.split("/");
  const name = entry.name;

  if (segments.some((segment) => excludedSourceEntries.has(segment))) {
    return true;
  }

  if (excludedSourceFiles.has(name)) {
    return true;
  }

  if (entry.isDirectory() && (name === "bin" || name === "obj")) {
    return true;
  }

  if (!entry.isDirectory() && (normalizedPath.endsWith(".log") || normalizedPath.endsWith(".db"))) {
    return true;
  }

  return false;
};

const cleanupTargets = [
  path.join(artifactsRoot, "windows-portable-runtime"),
  path.join(projectRoot, "dist"),
  path.join(projectRoot, "EaaSE-sync"),
  path.join(projectRoot, "handle_tool"),
  path.join(projectRoot, "handle.zip"),
  path.join(projectRoot, "tsconfig.app.tsbuildinfo"),
  path.join(projectRoot, "scripts", "portable-launcher", "bin"),
  path.join(projectRoot, "scripts", "portable-launcher", "obj"),
  tempRoot,
];

const resolveSpawnSpec = (command, args) => {
  if (process.platform === "win32" && command === "npm") {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", "npm", ...args],
    };
  }

  if (process.platform === "win32" && command === "powershell") {
    return {
      command: "powershell.exe",
      args,
    };
  }

  return {
    command,
    args,
  };
};

const run = (command, args, cwd = projectRoot) =>
  new Promise((resolve, reject) => {
    const spawnSpec = resolveSpawnSpec(command, args);
    const child = spawn(spawnSpec.command, spawnSpec.args, {
      cwd,
      stdio: "inherit",
      shell: false,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code ?? -1}`));
    });
  });

const ensureDir = async (targetPath) => {
  await fs.mkdir(targetPath, { recursive: true });
};

const writeText = async (targetPath, content) => {
  await ensureDir(path.dirname(targetPath));
  await fs.writeFile(targetPath, content.replace(/\n/g, "\r\n"), "utf8");
};

const resetDir = async (targetPath) => {
  await fs.rm(targetPath, { recursive: true, force: true });
  await fs.mkdir(targetPath, { recursive: true });
};

const copySourceTree = async (sourceRoot, targetRoot, relativeRoot = "") => {
  const currentSourceRoot = relativeRoot ? path.join(sourceRoot, relativeRoot) : sourceRoot;
  const entries = await fs.readdir(currentSourceRoot, { withFileTypes: true });

  for (const entry of entries) {
    const nextRelativePath = relativeRoot ? path.join(relativeRoot, entry.name) : entry.name;

    if (shouldSkipSourcePath(nextRelativePath, entry)) {
      continue;
    }

    const sourcePath = path.join(sourceRoot, nextRelativePath);
    const targetPath = path.join(targetRoot, nextRelativePath);

    if (entry.isDirectory()) {
      await ensureDir(targetPath);
      await copySourceTree(sourceRoot, targetRoot, nextRelativePath);
      continue;
    }

    await ensureDir(path.dirname(targetPath));
    await fs.copyFile(sourcePath, targetPath);
  }
};

const zipWithPowerShell = async (sourcePath, destinationPath) => {
  await fs.rm(destinationPath, { force: true });
  await run("powershell", [
    "-NoProfile",
    "-Command",
    `Compress-Archive -Path '${sourcePath.replace(/'/g, "''")}' -DestinationPath '${destinationPath.replace(/'/g, "''")}' -CompressionLevel Optimal`,
  ]);
};

const createLinuxRuntimeArchive = async () => {
  const linuxPayloadName = `Excel Strict Searcher-${version}-linux-x64`;
  const linuxBuildRoot = path.join(tempRoot, "linux-build");
  const linuxPayloadRoot = path.join(linuxBuildRoot, linuxPayloadName);

  await ensureDir(path.join(linuxPayloadRoot, "dist"));
  await ensureDir(path.join(linuxPayloadRoot, "scripts"));
  await ensureDir(path.join(linuxPayloadRoot, "config"));

  await fs.cp(path.join(projectRoot, "dist"), path.join(linuxPayloadRoot, "dist"), { recursive: true });
  await buildRuntimeServer(path.join(linuxPayloadRoot, "scripts", "serve-dist.cjs"));

  await writeText(
    path.join(linuxPayloadRoot, "start-linux.sh"),
    `#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p config
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found."
  echo "Please install Node.js 18+ and rerun ./start-linux.sh."
  exit 1
fi
node scripts/serve-dist.cjs
`,
  );

  await writeText(
    path.join(linuxPayloadRoot, "README_CN.txt"),
    `EaaSE Linux 运行包

启动方式：
1. 确保系统已安装 Node.js
2. 执行 chmod +x start-linux.sh
3. 执行 ./start-linux.sh

说明：
- 程序本地运行、只读处理 Excel，不修改原始文件
- 默认缓存与手动配置统一写入软件目录下的 config/
- 界面支持中文、English、日本語
`,
  );

  const tarGzPath = path.join(tempRoot, `Excel Strict Searcher-${version}-linux-x64.tar.gz`);
  await run("tar", ["-czf", tarGzPath, "-C", linuxBuildRoot, linuxPayloadName]);

  return tarGzPath;
};

const cleanup = async () => {
  for (const target of cleanupTargets) {
    await fs.rm(target, { recursive: true, force: true });
  }
};

const main = async () => {
  await cleanup();
  await ensureDir(tempRoot);

  await run("npm", ["run", "package:portable-exe"]);
  await run("npm", ["run", "package:portable-runtime"]);

  await resetDir(githubRoot);
  const githubSource = path.join(githubRoot, "source");
  await ensureDir(githubSource);
  await copySourceTree(projectRoot, githubSource);

  const windowsSetupStage = path.join(tempRoot, "windows-setup");
  await fs.cp(windowsPortableExe, windowsSetupStage, { recursive: true });
  await zipWithPowerShell(windowsSetupStage, path.join(githubRoot, `Excel Strict Searcher-${version}-windows-setup.zip`));

  const lightweightStage = path.join(tempRoot, "lightweight-runtime");
  await fs.cp(windowsPortableRuntime, lightweightStage, { recursive: true });
  await writeText(
    path.join(lightweightStage, "DISCLAIMER.txt"),
    `EaaSE Windows 轻量包说明

- 这是兼容与对照用途的本地运行时测试包，不是当前主推的 Windows 桌面封装形态。
- 程序只读处理 Excel，不修改原始文件。
- 默认缓存与手动配置统一写入软件目录下的 config/。
`,
  );
  await writeText(
    path.join(lightweightStage, "DOWNLOADS.txt"),
    `本包附带：
- Node.js Windows x64 官方安装包

若系统未安装 Node.js，请先安装后再运行 start-windows.cmd。
`,
  );
  await zipWithPowerShell(lightweightStage, path.join(githubRoot, `Excel Strict Searcher-${version}-windows-lightweight.zip`));

  await run("npm", ["run", "package:windows-installer"]);

  const installerExeSource = path.join(windowsInstallerRelease, "EaaSE-Setup.exe");
  const installerExeTarget = path.join(githubRoot, `Excel Strict Searcher-${version}-windows-installer.exe`);
  await fs.copyFile(installerExeSource, installerExeTarget);

  const linuxRoot = path.join(tempRoot, "linux");
  await ensureDir(linuxRoot);
  const linuxArchive = await createLinuxRuntimeArchive();
  await fs.copyFile(linuxArchive, path.join(linuxRoot, path.basename(linuxArchive)));
  await writeText(
    path.join(linuxRoot, "README_CN.txt"),
    `EaaSE Linux 压缩包说明

压缩包内包含：
- Linux tar.gz 运行包
- 本说明文件

运行前请确保系统已安装 Node.js。
`,
  );
  await zipWithPowerShell(linuxRoot, path.join(githubRoot, `Excel Strict Searcher-${version}-linux.zip`));

  await cleanup();
  process.stdout.write(`GitHub release sync completed at ${githubRoot}\n`);
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
