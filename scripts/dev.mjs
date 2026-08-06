import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync, spawn } from "node:child_process";

const cwd = process.cwd();
const cacheTargets = [".next", ".turbo", join("node_modules", ".cache")];

for (const target of cacheTargets) {
  const path = join(cwd, target);
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
    console.log(`Removed ${target}/`);
  }
}

function stopPort(port) {
  try {
    const output = execSync(
      `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue).OwningProcess"`,
      { encoding: "utf8" },
    ).trim();

    const pids = [...new Set(output.split(/\s+/).filter(Boolean))]
      .map((value) => Number.parseInt(value, 10))
      .filter((pid) => Number.isFinite(pid) && pid > 0);

    for (const pid of pids) {
      try {
        execSync(`powershell -NoProfile -Command "Stop-Process -Id ${pid} -Force"`);
        console.log(`Stopped process ${pid} on port ${port}`);
      } catch {
        // Ignore processes we cannot stop.
      }
    }
  } catch {
    // Port was free.
  }
}

for (const port of [3000, 3001, 3002, 3003]) {
  stopPort(port);
}

console.log("Starting Next.js dev server on http://localhost:3000 ...");

const child = spawn("npx", ["next", "dev", "-p", "3000"], {
  cwd,
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
