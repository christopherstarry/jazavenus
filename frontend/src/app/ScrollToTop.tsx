import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Reset the page scroll to the top whenever the user navigates to a new
 * route. Without this, opening a new screen can leave the viewport at
 * whatever scroll position the previous screen had — which especially
 * confuses older users who then think the page is "broken" or empty
 * because they're staring at the bottom of the new content.
 *
 * Notes:
 *  - Triggers on pathname AND hash so both `/x` → `/y` and `/x#a` →
 *    `/x#b` reset cleanly.
 *  - We do NOT scroll on plain query-string changes — those usually
 *    represent in-place data updates (filtering, paging) where the
 *    user expects to stay where they are.
 *  - Uses "auto" behaviour (instant): smooth scrolling on a long page
 *    looks like a glitch and slows older users down.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
