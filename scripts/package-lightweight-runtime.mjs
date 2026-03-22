import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const outputRoot = path.join(projectRoot, "..", "lightweight-runtime");
const scriptsRoot = path.join(outputRoot, "scripts");
const zipOutputPath = path.join(projectRoot, "..", "lightweight-runtime-windows.zip");

const ensureDistExists = async () => {
  await fs.access(path.join(distRoot, "index.html"));
};

const resetOutput = async () => {
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.mkdir(scriptsRoot, { recursive: true });
};

const writeText = (relativePath, content) =>
  fs.writeFile(path.join(outputRoot, relativePath), content.replace(/\n/g, "\r\n"), "utf8");

const runNodeInstallerDownload = async () =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, "download-node-installer.mjs")], {
      cwd: projectRoot,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`download-node-installer.mjs exited with code ${code ?? -1}`));
    });
  });

const createWindowsZip = async () => {
  if (process.platform !== "win32") {
    return;
  }

  await fs.rm(zipOutputPath, { force: true });

  await new Promise((resolve, reject) => {
    const child = spawn(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Compress-Archive -LiteralPath '${outputRoot}' -DestinationPath '${zipOutputPath}' -Force`,
      ],
      { cwd: projectRoot, stdio: "inherit" },
    );

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Compress-Archive exited with code ${code ?? -1}`));
    });
  });
};

const main = async () => {
  await ensureDistExists();
  await resetOutput();
  await runNodeInstallerDownload();

  await fs.cp(distRoot, path.join(outputRoot, "dist"), { recursive: true });
  await fs.copyFile(path.join(__dirname, "serve-dist.mjs"), path.join(scriptsRoot, "serve-dist.mjs"));

  await writeText(
    "START_HERE.txt",
    `Excel Strict Searcher - 轻量运行版

这个版本适合不想下载完整桌面包的用户。
程序本体以浏览器本地运行方式启动，保持只读，不会修改 Excel 原文件。
软件界面支持中文、English、日本語三种语言，可在页面顶部切换。

Windows 使用方法：
1. 双击 start-windows.cmd
2. 如果电脑里没有 Node.js，启动器会提示安装随包附带的 Node.js 官方安装包
3. 安装完成后重新运行 start-windows.cmd
4. 浏览器会自动打开 http://127.0.0.1:4173

Linux 桌面环境使用方法：
1. 先通过系统包管理器或内部镜像安装 Node.js
2. 运行 ./start-linux-desktop.sh
3. 如果浏览器没有自动打开，可手动访问 http://127.0.0.1:4173

Linux 无桌面/服务器使用方法：
1. 先安装 Node.js
2. 运行 ./start-linux-lan.sh
3. 按终端输出的局域网地址，在同机或同局域网浏览器中访问

注意事项：
- 本工具为本地只读检索工具，不会上传文件到服务器。
- 不要直接用 file:// 打开 dist/index.html。
- Linux 无桌面环境时，不支持本地 GUI 启动，但可以使用局域网访问模式。
- Windows 附带的 Node.js 安装包来自 nodejs.org 官方 x64 LTS MSI。
`,
  );

  await writeText(
    "DISCLAIMER.txt",
`免责声明

Excel Strict Searcher 是一个本地只读检索工具。
它不提供法律、合规、审计、留档或数据保全保证。
在使用本工具前，你需要自行确认文件内容、访问权限、部署环境和业务适用性。
请不要把本工具当作备份、审计或安全控制措施的替代品。

Node.js 运行环境说明

轻量版依赖 Node.js 运行。
Windows 轻量版已附带 nodejs.org 官方 Node.js x64 LTS 安装包，缺失 Node.js 时可直接安装。
Linux 轻量版不附带 Node.js，请通过系统包管理器或内部镜像自行安装。
软件界面支持中文、English、日本語三种语言切换。
`,
  );

  await writeText(
    "DOWNLOADS.txt",
`随包附带的依赖文件

Windows：
- 官方 Node.js LTS x64 MSI 安装包位于 ./prereqs/windows
- 启动器检测不到 Node.js 时，会优先提示安装这个官方安装包

Linux：
- 不附带 Node.js 安装包
- 请在启动前通过系统包管理器或内部镜像安装 Node.js
`,
  );

  await writeText(
    "README_CN.txt",
    `Excel Strict Searcher 轻量运行版说明

一、这个版本适合谁
- 适合已经安装浏览器，且希望减少下载体积的用户
- Windows 下如果没有 Node.js，也可以通过本目录自带的官方安装包补装
- 软件界面支持中文、English、日本語三种语言

二、和桌面安装版的区别
- 轻量版不是完整桌面壳，而是本地启动一个小型本地服务，再自动打开浏览器
- 优点是总体更轻，缺点是首次使用可能需要补装 Node.js

三、启动方式
- Windows：双击 start-windows.cmd
- Linux 桌面：运行 ./start-linux-desktop.sh
- Linux 无桌面：运行 ./start-linux-lan.sh

四、重要说明
- 本工具本地运行、只读处理，不修改原始 Excel 文件
- 不要把它部署成公开互联网服务
- 如果在企业内网环境使用，请自行确认权限、合规和网络边界
`,
  );

  await writeText(
    "start-windows.cmd",
    `@echo off
setlocal

cd /d "%~dp0"

if not exist "dist\\index.html" (
  echo 未找到 dist\\index.html。
  echo 请先重新生成轻量版文件。
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo 当前系统没有检测到 Node.js。
  echo.
  for %%F in ("%~dp0prereqs\\windows\\node-v*-x64.msi") do set "NODE_INSTALLER=%%~fF"
  if defined NODE_INSTALLER (
    echo 轻量运行版依赖 Node.js。
    echo 当前目录已附带 Node.js 官方 Windows x64 LTS 安装包：
    echo %NODE_INSTALLER%
    echo.
    choice /M "是否现在安装 Node.js"
    if errorlevel 2 (
      echo 已取消安装，程序无法继续启动。
      pause
      exit /b 1
    )
    start /wait msiexec /i "%NODE_INSTALLER%"
    where node >nul 2>nul
    if errorlevel 1 (
      echo 安装结束后仍未检测到 Node.js。
      echo 请重新打开本启动器，或者在系统 PATH 刷新后再试一次。
      pause
      exit /b 1
    )
  ) else (
    echo 当前目录未找到 Node.js 安装包。
    echo 现在将打开 Node.js 官网下载页面。
    start "" "https://nodejs.org/en/download/"
    pause
    exit /b 1
  )
)

start "Excel Strict Searcher" /min cmd /c node "%~dp0scripts\\serve-dist.mjs"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:4173"
exit /b 0
`,
  );

  await fs.writeFile(
    path.join(outputRoot, "start-linux-desktop.sh"),
    `#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "当前系统没有检测到 Node.js。"
  echo "请先通过系统包管理器或内部镜像安装 Node.js。"
  exit 1
fi

if [[ -z "\${DISPLAY:-}" && -z "\${WAYLAND_DISPLAY:-}" && -z "\${XDG_CURRENT_DESKTOP:-}" ]]; then
  echo "当前没有检测到桌面环境。"
  echo "请改用 ./start-linux-lan.sh 局域网访问模式，或者先安装桌面环境。"
  exit 1
fi

node "./scripts/serve-dist.mjs" &
SERVER_PID=$!
trap 'kill $SERVER_PID >/dev/null 2>&1 || true' EXIT
sleep 2

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://127.0.0.1:4173" >/dev/null 2>&1 || true
fi

wait $SERVER_PID
`,
    "utf8",
  );

  await fs.writeFile(
    path.join(outputRoot, "start-linux-lan.sh"),
    `#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "当前系统没有检测到 Node.js。"
  echo "请先通过系统包管理器或内部镜像安装 Node.js。"
  exit 1
fi

HOST=0.0.0.0 PORT=4173 node "./scripts/serve-dist.mjs"
`,
    "utf8",
  );

  await fs.writeFile(
    path.join(outputRoot, "install-linux-desktop-entry.sh"),
    `#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
APP_DIR="$(pwd)"

if [[ -z "\${DISPLAY:-}" && -z "\${WAYLAND_DISPLAY:-}" && -z "\${XDG_CURRENT_DESKTOP:-}" ]]; then
  echo "创建桌面图标需要桌面环境。"
  exit 1
fi

mkdir -p "$HOME/.local/share/applications"

cat > "$HOME/.local/share/applications/excel-strict-searcher-lightweight.desktop" <<'EOF'
[Desktop Entry]
Type=Application
Name=Excel Strict Searcher Lightweight
Name[zh_CN]=Excel Strict Searcher 轻量版
Exec=bash -lc 'cd "__APP_DIR__" && ./start-linux-desktop.sh'
Terminal=false
Categories=Utility;Office;
EOF

sed -i "s|__APP_DIR__|$APP_DIR|g" "$HOME/.local/share/applications/excel-strict-searcher-lightweight.desktop"

chmod +x "$HOME/.local/share/applications/excel-strict-searcher-lightweight.desktop"

if [[ -d "$HOME/Desktop" ]]; then
  cp "$HOME/.local/share/applications/excel-strict-searcher-lightweight.desktop" "$HOME/Desktop/"
  chmod +x "$HOME/Desktop/excel-strict-searcher-lightweight.desktop"
fi

echo "桌面启动项已创建。"
`,
    "utf8",
  );

  await fs.access(path.join(outputRoot, "prereqs", "windows", "node-installer.json"));
  await createWindowsZip();
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
