// Rebuild favicon and touch icons from the existing event logo.
// The share image is a real homepage screenshot and is preserved by this script.
// Run from the project root: node scripts/generate-brand-assets.mjs
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const logo = await readFile(new URL("../assets/dahana-logo-no-bg.png", import.meta.url));
const output = new URL("../public/branding/", import.meta.url);
await mkdir(output, { recursive: true });
const navy = "#02040d";

async function icon(size) {
  return sharp(logo)
    .trim()
    .resize(size, size, { fit: "contain", background: navy })
    .flatten({ background: navy })
    .png()
    .toBuffer();
}

await writeFile(new URL("icon-192.png", output), await icon(192));
await writeFile(new URL("apple-touch-icon.png", output), await icon(180));

// ICO container with PNG-encoded frames for standard browser tab sizes.
const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map(icon));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
frames.forEach((frame, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index];
  header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(frame.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await writeFile(new URL("../public/favicon.ico", import.meta.url), Buffer.concat([header, ...frames]));

console.log("Generated favicon and touch icons. Homepage screenshot preserved.");
