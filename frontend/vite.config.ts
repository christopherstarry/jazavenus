import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

/** When set (dotnet publish CI), writes the SPA beside the ASP.NET `wwwroot` folder. See Jaza.Api.csproj */
function viteOutDir(): { outDir: string; emptyOutDir: boolean } {
  const raw = process.env.JAZA_VITE_OUTDIR;
  if (!raw) return { outDir: "dist", emptyOutDir: true };
  const outDir = path.isAbsolute(raw) ? path.normalize(raw) : path.resolve(__dirname, raw);
  return { outDir, emptyOutDir: false };
}

/** GitHub Pages project sites live under /<repo>/; user sites <user>.github.io use "/". */
function viteBase(): string {
  const raw = process.env.VITE_PAGES_BASE;
  if (raw === "/" || raw === undefined || raw === "") return "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

export default defineConfig({
  base: viteBase(),
  plugins: [react(), tailwind()],
  resolve: { alias: { "#": path.resolve(__dirname, "src") } },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "https://localhost:5001", changeOrigin: true, secure: false },
      "/health": { target: "https://localhost:5001", changeOrigin: true, secure: false },
    },
  },
  build: {
    sourcemap: true,
    target: "es2022",
    ...viteOutDir(),
  },
});
