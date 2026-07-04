/** Map Cloudflare Worker bindings to process.env for server code. */
export function applyCloudflareEnv(env: unknown): void {
  if (!env || typeof env !== "object") return;

  for (const [key, value] of Object.entries(env as Record<string, unknown>)) {
    if (typeof value !== "string" || !value) continue;
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
