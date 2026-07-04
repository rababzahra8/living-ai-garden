import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { arch, platform } from "node:os";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

/** Packages that must load on Linux CI (Vite 8 / Tailwind 4 use native bindings). */
const REQUIRED_MODULES = ["@tailwindcss/oxide", "lightningcss", "vite"];

/** Extra pins for nested optional deps npm ci often skips (vite bundles rolldown@1.0.3). */
const NESTED_LINUX_BINDINGS = [
  "@rolldown/binding-linux-x64-gnu@1.0.3",
  "@rolldown/binding-linux-x64-musl@1.0.3",
  "@rolldown/binding-linux-x64-gnu@1.1.0",
  "@rolldown/binding-linux-x64-musl@1.1.0",
  "@tailwindcss/oxide-linux-x64-gnu@4.2.4",
  "@tailwindcss/oxide-linux-x64-musl@4.2.4",
  "lightningcss-linux-x64-gnu@1.32.0",
  "lightningcss-linux-x64-musl@1.32.0",
];

function verifyNativeModules() {
  for (const name of REQUIRED_MODULES) {
    try {
      require.resolve(name);
      require(name);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Native module check failed for "${name}": ${message}`);
    }
  }
}

/** Cloudflare/npm ci often skip platform optional deps — reinstall them on Linux x64. */
export function ensureNativeBindings() {
  if (platform() !== "linux" || arch() !== "x64") return;

  console.log("[ensure-native-bindings] Reinstalling Linux optional native modules...");

  execSync("npm install --include=optional --no-audit --no-fund", {
    stdio: "inherit",
  });

  execSync(
    `npm install --no-save --include=optional ${NESTED_LINUX_BINDINGS.join(" ")}`,
    { stdio: "inherit" },
  );

  verifyNativeModules();
  console.log("[ensure-native-bindings] All native bindings OK");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    ensureNativeBindings();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
