import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildRuntimeServer } from "./build-runtime-server.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const outputRoot = path.join(projectRoot, "artifacts", "windows-portable-runtime");
const scriptsRoot = path.join(outputRoot, "scripts");

const ensureDistExists = async () => {
  await fs.access(path.join(distRoot, "index.html"));
};

const resetOutput = async () => {
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.mkdir(scriptsRoot, { recursive: true });
  await fs.mkdir(path.join(outputRoot, "config"), { recursive: true });
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

  await fs.cp(distRoot, path.join(outputRoot, "dist"), { recursive: true });
  await buildRuntimeServer(path.join(scriptsRoot, "serve-dist.cjs"));

  await run("node", [
    path.join(__dirname, "download-node-installer.mjs"),
    path.join("artifacts", "windows-portable-runtime", "prereqs", "windows"),
  ]);

  await writeText(
    "START_HERE.txt",
    `EaaSE Windows 散装测试包\n\n启动方式：\n1. 双击 start-windows.cmd\n2. 如果系统里没有 Node.js，启动器会提示安装当前目录附带的官方 Node.js MSI\n3. 浏览器会自动打开 http://127.0.0.1:4173\n\n这是测试用散装运行目录，不是安装器。\n`,
  );

  await writeText(
    "README_CN.txt",
    `EaaSE Windows 散装测试包说明\n\n一、用途\n- 这是测试阶段使用的本地运行目录\n- 程序会启动本地服务，再用系统默认浏览器打开界面\n- 这样可以直接测试导入文件、导入文件夹、打开所在位置、默认缓存和项目档案\n\n二、目录说明\n- start-windows.cmd: Windows 启动入口\n- dist/: 前端静态资源\n- scripts/serve-dist.cjs: 已内联依赖的本地运行时与 API 服务\n- config/: 默认缓存与项目档案目录\n- prereqs/windows/: 官方 Node.js 安装包\n\n三、缓存与档案\n- 启动时会优先读取软件目录下 config/ 中的默认缓存\n- 手动载入项目档案后，当前工作集会自动覆盖默认缓存\n- 默认缓存和项目档案统一从软件本体目录下的 config/ 读取与写入\n\n四、重要说明\n- 本工具本地运行、只读处理，不修改原始 Excel 文件\n- 软件界面支持中文、English、日本語三种语言\n- 如果通过浏览器文件选择进入纯网页回退模式，无法获得真实绝对路径\n`,
  );

  await writeText(
    "start-windows.cmd",
    `@echo off\nsetlocal\n\ncd /d "%~dp0"\n\nif not exist "dist\\index.html" (\n  echo 未找到 dist\\index.html。\n  pause\n  exit /b 1\n)\n\nif not exist "config" mkdir "config"\n\nwhere node >nul 2>nul\nif errorlevel 1 (\n  echo 当前系统没有检测到 Node.js。\n  echo.\n  for %%F in ("%~dp0prereqs\\windows\\node-v*-x64.msi") do set "NODE_INSTALLER=%%~fF"\n  if defined NODE_INSTALLER (\n    echo 本测试包依赖 Node.js。\n    echo 当前目录已附带 Node.js 官方 Windows x64 安装包：\n    echo %NODE_INSTALLER%\n    echo.\n    choice /M "是否现在安装 Node.js"\n    if errorlevel 2 (\n      echo 已取消安装，程序无法继续启动。\n      pause\n      exit /b 1\n    )\n    start /wait msiexec /i "%NODE_INSTALLER%"\n    where node >nul 2>nul\n    if errorlevel 1 (\n      echo 安装结束后仍未检测到 Node.js。\n      echo 请重新打开本启动器，或者在系统 PATH 刷新后再试一次。\n      pause\n      exit /b 1\n    )\n  ) else (\n    echo 当前目录未找到 Node.js 安装包。\n    echo 现在将打开 Node.js 官网下载页面。\n    start "" "https://nodejs.org/en/download/"\n    pause\n    exit /b 1\n  )\n)\n\nstart "EaaSE Local Runtime" /min cmd /c node "%~dp0scripts\\serve-dist.cjs" 1^> "%~dp0config\\server.log" 2^>^&1\n\ntimeout /t 2 /nobreak >nul\nstart "" "http://127.0.0.1:4173"\nexit /b 0\n`,
  );

  process.stdout.write(`Portable runtime package created at ${outputRoot}\n`);
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});

