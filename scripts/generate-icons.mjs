#!/usr/bin/env node
/** Regenerate favicons, PWA icons, and og-image from public/logo/aigarden-icon-light.svg */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = resolve(root, "public");
const logoDir = resolve(publicDir, "logo");
const iconsDir = resolve(publicDir, "icons");
const sourceSvg = resolve(logoDir, "aigarden-icon-light.svg");

function readPngDimensions(png) {
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

function pngToIco(pngPaths, icoPath) {
  const images = pngPaths.map((path) => {
    const data = readFileSync(path);
    return { data, ...readPngDimensions(data) };
  });

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  const blobs = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    blobs.push(img.data);
    offset += img.data.length;
  }

  writeFileSync(icoPath, Buffer.concat([header, ...entries, ...blobs]));
}

if (!existsSync(sourceSvg)) {
  console.error("Missing public/logo/aigarden-icon-light.svg");
  process.exit(1);
}

mkdirSync(iconsDir, { recursive: true });

const svg = readFileSync(sourceSvg);
const sizes = [16, 32, 48, 64, 128, 180, 192, 512];

for (const size of sizes) {
  const out = resolve(iconsDir, `icon-${size}.png`);
  await sharp(svg, { density: Math.max(72, Math.ceil((size / 512) * 144)) })
    .resize(size, size)
    .png()
    .toFile(out);
}

await sharp(svg, { density: 216 }).resize(1200, 1200).jpeg({ quality: 90 }).toFile(resolve(publicDir, "og-image.jpg"));

writeFileSync(resolve(publicDir, "apple-touch-icon.png"), readFileSync(resolve(iconsDir, "icon-180.png")));

pngToIco(
  [16, 32, 48].map((s) => resolve(iconsDir, `icon-${s}.png`)),
  resolve(publicDir, "favicon.ico"),
);

const manifest = {
  name: "Living AI Garden",
  short_name: "AI Garden",
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
  theme_color: "#172417",
  background_color: "#F5F1E3",
};

writeFileSync(resolve(publicDir, "site.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log("Generated favicon.ico, og-image.jpg, apple-touch-icon.png, icons/*, site.webmanifest");
