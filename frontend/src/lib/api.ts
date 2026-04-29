import ky, { HTTPError } from "ky";

/**
 * Read a cookie value by name. We use this only for the XSRF-TOKEN cookie, which the API issues
 * as non-HttpOnly so we can read its value and echo it back in the X-XSRF-TOKEN header
 * (OWASP-recommended double-submit cookie pattern).
 *
 * IMPORTANT: do NOT read the framework's "jaza.xsrf" cookie here — that one carries the cookie
 * token, not the request token, and the antiforgery service will reject requests that echo it.
 */
function getCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&")}=([^;]*)`));
  return m ? decodeURIComponent(m[1]!) : undefined;
}

export const api = ky.create({
  prefixUrl: "/api",
  credentials: "include",
  retry: { limit: 1, methods: ["get"] },
  timeout: 30_000,
  hooks: {
    beforeRequest: [
      (req) => {
        const token = getCookie("XSRF-TOKEN");
        const method = req.method.toUpperCase();
        if (token && method !== "GET" && method !== "HEAD") {
          req.headers.set("X-XSRF-TOKEN", token);
        }
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
