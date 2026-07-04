/**
 * Cloudflare Workers Builds expose two separate env buckets:
 * - Build variables → available during `npm run build` (must include VITE_* for the browser)
 * - Variables and Secrets → available at runtime only (SSR / server functions)
 *
 * If build vars use SUPABASE_* but omit VITE_*, copy them before Vite runs.
 */

const pairs = [
  ["VITE_SUPABASE_URL", "SUPABASE_URL"],
  ["VITE_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY"],
  ["VITE_SUPABASE_PROJECT_ID", "SUPABASE_PROJECT_ID"],
];

for (const [viteKey, sourceKey] of pairs) {
  if (!process.env[viteKey] && process.env[sourceKey]) {
    process.env[viteKey] = process.env[sourceKey];
  }
}

const hasUrl = Boolean(process.env.VITE_SUPABASE_URL);
const hasKey = Boolean(process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

if (!hasUrl || !hasKey) {
  console.warn(
    "[build] Supabase client env missing for the browser bundle.",
    "Set VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY",
    "(or SUPABASE_* with the same values) as Cloudflare **Build variables**, then redeploy.",
  );
  if (process.env.CI === "true" || process.env.CF_PAGES === "1") {
    process.exit(1);
  }
} else {
  console.log("[build] Supabase VITE_* env present for client bundle.");
}
