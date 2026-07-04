#!/usr/bin/env node
/** Regenerate favicon.ico, og-image.jpg, apple-touch-icon.png from public/icon.jpg or icon.png */
import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = resolve(root, "public");
const iconPath = ["icon.jpg", "icon.png", "icon.jpeg"]
  .map((name) => resolve(publicDir, name))
  .find((path) => existsSync(path));

function sips(args) {
  const r = spawnSync("sips", args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function sipsSize(path) {
  const r = spawnSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", path], { encoding: "utf8" });
  const w = Number(r.stdout.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0);
  const h = Number(r.stdout.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0);
  return { w, h };
}

function sipsResize(input, output, size) {
  copyFileSync(input, output);
  sips(["-Z", String(size), output, "--out", output]);
}

function centerSquareCrop(input, output) {
  copyFileSync(input, output);
  const { w, h } = sipsSize(output);
  const side = Math.min(w, h);
  const offsetX = Math.max(0, Math.floor((w - side) / 2));
  const offsetY = Math.max(0, Math.floor((h - side) / 2));
  sips(["--cropToHeightWidth", String(side), String(side), "--cropOffset", String(offsetY), String(offsetX), output, "--out", output]);
}

function pngToIco(pngPath, icoPath) {
  const png = readFileSync(pngPath);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(width >= 256 ? 0 : width, 0);
  entry.writeUInt8(height >= 256 ? 0 : height, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  writeFileSync(icoPath, Buffer.concat([header, entry, png]));
}

if (!iconPath) {
  console.error("Missing public/icon.jpg or public/icon.png");
  process.exit(1);
}

const squareCrop = resolve(publicDir, ".icon-square.png");
const faviconPng = resolve(publicDir, ".favicon-tmp.png");
const ogImage = resolve(publicDir, "og-image.jpg");
const appleTouch = resolve(publicDir, "apple-touch-icon.png");

sipsResize(iconPath, ogImage, 1200);
centerSquareCrop(iconPath, squareCrop);
sips(["-s", "format", "png", squareCrop, "--out", squareCrop]);
sipsResize(squareCrop, appleTouch, 180);
sipsResize(squareCrop, faviconPng, 64);
pngToIco(faviconPng, resolve(publicDir, "favicon.ico"));
unlinkSync(squareCrop);
unlinkSync(faviconPng);

const { w, h } = sipsSize(ogImage);
console.log(`Generated favicon.ico, og-image.jpg (${w}x${h}), apple-touch-icon.png`);
