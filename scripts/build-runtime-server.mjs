import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const entryPoint = path.join(__dirname, "serve-dist.mjs");

const run = (command, args, cwd = projectRoot) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "pipe",
      shell: false,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          `${command} exited with code ${code ?? -1}\n${stdout}${stderr}`.trim(),
        ),
      );
    });
  });

export const buildRuntimeServer = async (outputFile) => {
  await build({
    entryPoints: [entryPoint],
    outfile: outputFile,
    bundle: true,
    format: "cjs",
    platform: "node",
    target: "node24",
    sourcemap: false,
    legalComments: "none",
    logLevel: "silent",
  });

  const { stdout } = await run("node", [outputFile, "--validate-only"]);
  if (!stdout.includes("serve-dist validation ok")) {
    throw new Error(`runtime server validation failed for ${outputFile}`);
  }
};
