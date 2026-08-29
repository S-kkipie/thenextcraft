import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const command = process.platform === "win32" ? process.env.ComSpec ?? "cmd.exe" : npm;
const args = process.platform === "win32" ? ["/d", "/c", npm, "run", "dev"] : ["run", "dev"];
const processes = [
  { name: "web", cwd: resolve(root, "apps/web") },
  { name: "backend", cwd: resolve(root, "packages/backend") },
].map(({ name, cwd }) => {
  const child = spawn(command, args, {
    cwd,
    env: process.env,
    stdio: "inherit",
  });

  child.on("error", (error) => {
    console.error(`[${name}] ${error.message}`);
  });

  child.on("exit", (code, signal) => {
    if (code !== 0 && signal !== "SIGTERM") {
      console.error(`[${name}] exited with ${signal ?? `code ${code}`}`);
    }
  });

  return child;
});

let shuttingDown = false;
const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of processes) {
    if (!child.killed) child.kill(signal);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

await new Promise((resolvePromise) => {
  let remaining = processes.length;
  for (const child of processes) {
    child.once("exit", () => {
      remaining -= 1;
      if (remaining === 0) resolvePromise();
    });
  }
});
