/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** e.g. `https://jaza-venus.fly.dev/api` when the SPA is on a different origin (GitHub Pages). */
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SKIP_ANTIFORGERY?: string;
}
