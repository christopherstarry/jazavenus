import ky, { HTTPError, type KyRequest } from "ky";

/**
 * Read a cookie value by name. Used only for the XSRF-TOKEN cookie, which the API issues
 * non-HttpOnly so the SPA can echo it back in the X-XSRF-TOKEN header
 * (OWASP-recommended double-submit cookie pattern).
 *
 * IMPORTANT: do NOT read the framework's "jaza.xsrf" cookie here — that one carries the cookie
 * token, not the request token, and the antiforgery service will reject requests that echo it.
 */
function getCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&")}=([^;]*)`));
  return m ? decodeURIComponent(m[1]!) : undefined;
}

/** Lazily resolved at request time so we don't get a circular import with auth.tsx. */
let bearerProvider: () => string | null = () => null;
let refreshHandler: () => Promise<boolean> = async () => false;
let unauthorizedHandler: () => void = () => { /* noop */ };

export function configureApiAuth(opts: {
  getBearer: () => string | null;
  refresh: () => Promise<boolean>;
  onUnauthorized: () => void;
}) {
  bearerProvider = opts.getBearer;
  refreshHandler = opts.refresh;
  unauthorizedHandler = opts.onUnauthorized;
}

/** Routes we never want to auto-retry with a refresh because they ARE the refresh / login flow. */
const NO_RETRY_PATHS = ["auth/login", "auth/refresh", "auth/logout", "auth/antiforgery"];
function shouldRetryWithRefresh(req: KyRequest): boolean {
  const url = new URL(req.url);
  return !NO_RETRY_PATHS.some((p) => url.pathname.endsWith("/" + p));
}

/**
 * API root for ky. Local dev: `/api` (Vite proxies to the ASP.NET app).
 * Vercel hosting: `/api` (Vercel rewrites to the Fly backend in vercel.json).
 */
function apiPrefixUrl(): string {
  if (typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app")) {
    return "/api";
  }

  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!raw) return "/api";
  const base = raw.replace(/\/+$/, "");
  return base.length > 0 ? base : "/api";
}

export const api = ky.create({
  prefixUrl: apiPrefixUrl(),
  credentials: "include",
  retry: { limit: 1, methods: ["get"] },
  timeout: 30_000,
  hooks: {
    beforeRequest: [
      (req) => {
        // Antiforgery token for mutating requests (browser/cookie clients).
        const token = getCookie("XSRF-TOKEN");
        const method = req.method.toUpperCase();
        if (token && method !== "GET" && method !== "HEAD") {
          req.headers.set("X-XSRF-TOKEN", token);
        }
        // Bearer token for SPA-as-API-client (also accepted by the cookie-protected endpoints).
        const bearer = bearerProvider();
        if (bearer && !req.headers.has("Authorization")) {
          req.headers.set("Authorization", `Bearer ${bearer}`);
        }
      },
    ],
    afterResponse: [
      async (req, opts, res) => {
        if (res.status !== 401 || !shouldRetryWithRefresh(req)) return res;
        const refreshed = await refreshHandler();
        if (!refreshed) {
          unauthorizedHandler();
          return res;
        }
        // Retry with the new bearer.
        const newReq = req.clone();
        const bearer = bearerProvider();
        if (bearer) newReq.headers.set("Authorization", `Bearer ${bearer}`);
        return ky(newReq, opts);
      },
    ],
    beforeError: [
      async (error: HTTPError) => {
        try {
          const body = (await error.response.clone().json()) as { title?: string; detail?: string };
          error.message = body.title ?? body.detail ?? error.message;
        } catch { /* not JSON */ }
        return error;
      },
    ],
  },
});

/** Bootstrap the antiforgery cookie on app start, so the very first POST already has a token. */
export async function ensureAntiforgery(): Promise<void> {
  await api.get("auth/antiforgery");
}
