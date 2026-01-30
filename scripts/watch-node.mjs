#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import process from "node:process";

const args = process.argv.slice(2);
const env = { ...process.env };
const cwd = process.cwd();
const compiler = env.CLAWDBOT_TS_COMPILER === "tsc" ? "tsc" : "tsgo";
const projectArgs = ["--project", "tsconfig.json"];

const tscPath = process.platform === "win32" ? "node_modules\\.bin\\tsc.cmd" : "node_modules/.bin/tsc";

console.log(`[watch-node] Starting initial build using ${tscPath}...`);
const initialBuild = spawnSync(tscPath, projectArgs, {
  cwd,
  env,
  stdio: "inherit",
  shell: true,
});

if (initialBuild.status !== 0) {
  console.error(`[watch-node] Initial build failed with status ${initialBuild.status}`);
  process.exit(initialBuild.status ?? 1);
}
console.log(`[watch-node] Initial build successful.`);

const watchArgs =
  compiler === "tsc"
    ? [...projectArgs, "--watch", "--preserveWatchOutput"]
    : [...projectArgs, "--watch"];

const compilerProcess = spawn(tscPath, watchArgs, {
  cwd,
  env,
  stdio: "inherit",
  shell: true,
});

const filteredArgs = args.filter(arg => arg !== "--force");

const nodeProcess = spawn(process.execPath, ["--watch", "dist/entry.js", ...filteredArgs], {
  cwd,
  env,
  stdio: "inherit",
});

let exiting = false;

function cleanup(code = 0) {
  if (exiting) return;
  exiting = true;
  nodeProcess.kill("SIGTERM");
  compilerProcess.kill("SIGTERM");
  process.exit(code);
}

process.on("SIGINT", () => cleanup(130));
process.on("SIGTERM", () => cleanup(143));

compilerProcess.on("exit", (code) => {
  if (exiting) return;
  cleanup(code ?? 1);
});

nodeProcess.on("exit", (code, signal) => {
  if (signal || exiting) return;
  cleanup(code ?? 1);
});
