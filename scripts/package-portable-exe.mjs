// read ../AGENTS.md and ../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildRuntimeServer } from "./build-runtime-server.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const outputRoot = path.join(projectRoot, "artifacts", "windows-portable-exe");
const launcherProject = path.join(__dirname, "portable-launcher", "PortableLauncher.csproj");
const launcherPublishRoot = path.join(outputRoot, "launcher-publish");

const ensureDistExists = async () => {
  await fs.access(path.join(distRoot, "index.html"));
};

const resetOutput = async () => {
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.mkdir(outputRoot, { recursive: true });
};

const run = (command, args, cwd = projectRoot) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
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

const writeText = (relativePath, content) =>
  fs.writeFile(path.join(outputRoot, relativePath), content.replace(/\n/g, "\r\n"), "utf8");

const main = async () => {
  await ensureDistExists();
  await resetOutput();

  await fs.mkdir(path.join(outputRoot, "scripts"), { recursive: true });
  await fs.mkdir(path.join(outputRoot, "config"), { recursive: true });

  await fs.cp(distRoot, path.join(outputRoot, "dist"), { recursive: true });
  await buildRuntimeServer(path.join(outputRoot, "scripts", "serve-dist.cjs"));

  await run("node", [
    path.join(__dirname, "download-node-installer.mjs"),
    path.join("artifacts", "windows-portable-exe", "prereqs", "windows"),
  ]);
  await run("node", [
    path.join(__dirname, "download-webview2-bootstrapper.mjs"),
    path.join("artifacts", "windows-portable-exe", "prereqs", "windows"),
  ]);

  await run("dotnet", [
    "publish",
    launcherProject,
    "-c",
    "Release",
    "-r",
    "win-x64",
    "--self-contained",
    "true",
    "-o",
    launcherPublishRoot,
  ]);

  const launcherEntries = await fs.readdir(launcherPublishRoot, { withFileTypes: true });
  for (const entry of launcherEntries) {
    const sourcePath = path.join(launcherPublishRoot, entry.name);
    const targetPath = path.join(outputRoot, entry.name);

    if (entry.isDirectory()) {
      await fs.cp(sourcePath, targetPath, { recursive: true });
      continue;
    }

    await fs.copyFile(sourcePath, targetPath);
  }

  await fs.rm(launcherPublishRoot, { recursive: true, force: true });

  await writeText(
    "README_CN.txt",
    `EaaSE Windows 便携测试包

启动方式：
1. 双击 EaaSE.exe
2. 程序会在本地启动服务，并以内嵌 Windows 窗口打开 EaaSE
3. 若系统未安装 Node.js，会提示安装当前目录附带的官方 Node.js MSI
4. 若系统缺少 WebView2 Runtime，会提示安装当前目录附带的官方引导程序

目录说明：
- EaaSE.exe: Windows 桌面启动器
- dist/: 前端静态资源
- scripts/serve-dist.cjs: 已内联依赖的本地运行时
- config/: 默认缓存与项目档案目录
- prereqs/windows/: 官方 Node.js 安装包
- prereqs/windows/: 官方 WebView2 Runtime 引导程序

说明：
- 这是散装便携测试包，不是安装器
- 配置读写统一使用软件目录下的 config/
- 本工具本地运行、只读处理，不修改原始 Excel 文件
- EaaSE.exe 会直接打开桌面窗口，不再跳转到外部浏览器
`,
  );

  await writeText(
    "START_HERE.txt",
    `1. 双击 EaaSE.exe
2. 首次若缺少 Node.js，请按提示安装
3. 若缺少 WebView2 Runtime，请按提示安装
4. 程序会直接打开桌面窗口

这是测试用便携包，后续再封装正式安装器。
`,
  );

  process.stdout.write(`Portable exe package created at ${outputRoot}\n`);
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
