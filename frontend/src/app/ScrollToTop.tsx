import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Reset scroll to the top on route change. Prefers the app shell's {@link #app-main-scroll}
 * region when present (fixed-height layout); otherwise falls back to `window`.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const main = document.getElementById("app-main-scroll");
    if (main) {
      main.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
