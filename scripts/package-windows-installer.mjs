import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const portableOutput = path.join(projectRoot, "artifacts", "windows-portable-exe");
const installerProject = path.join(__dirname, "windows-installer", "EaaSEInstaller.csproj");
const payloadDir = path.join(__dirname, "windows-installer", "payload");
const payloadZip = path.join(payloadDir, "eaase-payload.zip");
const installerPublishDir = path.join(projectRoot, "artifacts", "windows-installer-publish");
const finalOutputDir = path.join(projectRoot, "windows-installer-release");
const finalInstallerPath = path.join(finalOutputDir, "EaaSE-Setup.exe");

const run = (command, args, cwd = projectRoot) =>
  new Promise((resolve, reject) => {
    const isWindowsNpm = process.platform === "win32" && command === "npm";
    const executable = isWindowsNpm ? "cmd.exe" : command;
    const finalArgs = isWindowsNpm ? ["/d", "/s", "/c", [command, ...args].join(" ")] : args;
    const child = spawn(executable, finalArgs, {
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

const ensurePortablePackage = async () => {
  await run("npm", ["run", "package:portable-exe"]);
};

const stagePayload = async () => {
  await fs.rm(payloadDir, { recursive: true, force: true });
  await fs.mkdir(payloadDir, { recursive: true });

  const stagingRoot = path.join(projectRoot, "artifacts", "windows-installer-stage");
  await fs.rm(stagingRoot, { recursive: true, force: true });
  await fs.mkdir(stagingRoot, { recursive: true });

  const appStage = path.join(stagingRoot, "app");
  await fs.cp(portableOutput, appStage, { recursive: true });

  const configDir = path.join(appStage, "config");
  await fs.rm(configDir, { recursive: true, force: true });
  await fs.mkdir(configDir, { recursive: true });

  await run("powershell", [
    "-NoProfile",
    "-Command",
    `Compress-Archive -Path "${appStage}\\*" -DestinationPath "${payloadZip}" -Force`,
  ]);

  await fs.rm(stagingRoot, { recursive: true, force: true });
};

const publishInstaller = async () => {
  await fs.rm(installerPublishDir, { recursive: true, force: true });
  await run("dotnet", [
    "publish",
    installerProject,
    "-c",
    "Release",
    "-r",
    "win-x64",
    "--self-contained",
    "true",
    "-o",
    installerPublishDir,
  ]);
};

const finalizeOutput = async () => {
  await fs.rm(finalOutputDir, { recursive: true, force: true });
  await fs.mkdir(finalOutputDir, { recursive: true });
  await fs.copyFile(path.join(installerPublishDir, "EaaSEInstaller.exe"), finalInstallerPath);
};

const cleanupArtifacts = async () => {
  await fs.rm(portableOutput, { recursive: true, force: true });
  await fs.rm(installerPublishDir, { recursive: true, force: true });
  await fs.rm(payloadDir, { recursive: true, force: true });
  await fs.rm(path.join(projectRoot, "artifacts", "windows-installer-stage"), { recursive: true, force: true });
};

const main = async () => {
  await ensurePortablePackage();
  await stagePayload();
  await publishInstaller();
  await finalizeOutput();
  await cleanupArtifacts();
  process.stdout.write(`Windows installer created at ${finalInstallerPath}\n`);
};

main().catch(async (error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
