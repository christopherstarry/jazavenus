import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwind()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "https://localhost:5001", changeOrigin: true, secure: false },
      "/health": { target: "https://localhost:5001", changeOrigin: true, secure: false },
    },
  },
  build: { sourcemap: true, target: "es2022" },
});
