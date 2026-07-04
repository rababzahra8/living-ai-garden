#!/usr/bin/env node
/**
 * Upload runtime secrets to Cloudflare (one-time locally, or each deploy from CI).
 *
 * Reads from .env and/or process.env (Cloudflare encrypted build variables).
 *
 * Usage:
 *   npm run cf:secrets          # local, from .env
 *   npm run cf:secrets:ci       # CI deploy step, from env only
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env");
const wranglerConfig = resolve(root, "wrangler.toml");

const SECRET_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "OPENAI_API_KEY",
  "GROQ_API_KEY",
  "GEMINI_API_KEY",
];

const ciOnly = process.argv.includes("--ci");

function parseEnvFile(path) {
  const text = readFileSync(path, "utf8");
  const out = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function readWorkerName() {
  if (!existsSync(wranglerConfig)) return "living-ai-garden";
  const match = readFileSync(wranglerConfig, "utf8").match(/^name\s*=\s*"([^"]+)"/m);
  return match?.[1] ?? "living-ai-garden";
}

const fileEnv = !ciOnly && existsSync(envPath) ? parseEnvFile(envPath) : {};
const values = {};

for (const key of SECRET_KEYS) {
  const val = (process.env[key] ?? fileEnv[key])?.trim();
  if (val) values[key] = val;
}

if (Object.keys(values).length === 0) {
  if (ciOnly) {
    console.log("[cf:secrets] No runtime secrets in CI env — skipping (set encrypted build vars once).");
    process.exit(0);
  }
  console.error("No runtime secrets found. Fill .env or pass env vars, then retry.");
  process.exit(1);
}

const workerName = readWorkerName();
const bulkPath = resolve(root, ".cf-secrets.bulk.env");
const lines = Object.entries(values).map(([k, v]) => `${k}=${v}`);
writeFileSync(bulkPath, lines.join("\n") + "\n");

console.log(`Uploading ${lines.length} secret(s) to worker "${workerName}"...`);
console.log("Keys:", Object.keys(values).join(", "));

const result = spawnSync(
  "npx",
  ["wrangler", "secret", "bulk", bulkPath, "--config", wranglerConfig],
  { cwd: root, stdio: "inherit", env: process.env },
);

unlinkSync(bulkPath);

process.exit(result.status ?? 1);
