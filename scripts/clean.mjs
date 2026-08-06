import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const targets = [".next", ".turbo", join("node_modules", ".cache")];

for (const target of targets) {
  const path = join(process.cwd(), target);
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
    console.log(`Removed ${target}/`);
  }
}

console.log("Cache cleared. Run npm run dev to start fresh.");
