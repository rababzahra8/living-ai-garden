import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode, command }) => {
  const envDefine: Record<string, string> = {};
  const viteEnv = loadEnv(mode, process.cwd(), "VITE_");
  for (const [key, value] of Object.entries(viteEnv)) {
    if (value) envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }
  // CI build vars (e.g. Cloudflare Workers Builds) may only exist on process.env.
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith("VITE_") && value) {
      envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
    }
  }

  const plugins = [
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    react(),
  ];

  if (command === "build") {
    plugins.push(
      nitro({
        defaultPreset: "cloudflare-module",
        preset: "cloudflare-module",
      }),
    );
  }

  return {
    define: envDefine,
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    plugins,
    server: { host: "::", port: 8080 },
  };
});
