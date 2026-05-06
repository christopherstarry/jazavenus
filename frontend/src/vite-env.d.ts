/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Vercel frontend -> Fly backend, e.g. `https://jaza-venus.fly.dev/api`. */
  readonly VITE_API_BASE_URL?: string;
}
