import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

/* React Testing Library doesn't auto-clean between tests when running in
 * vitest's parallel mode, so we do it ourselves. Without this, leftover
 * DOM from a previous test can leak into the next one's queries. */
afterEach(() => {
  cleanup();
});

/* matchMedia isn't implemented in jsdom — anything that consults it (e.g.
 * the system-theme detector in lib/settings.tsx) would crash at import
 * time. A no-op shim keeps the tests focused on real behaviour. */
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;
}
