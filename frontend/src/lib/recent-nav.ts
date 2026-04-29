import { useEffect, useState } from "react";

/**
 * Tracks the last few screens the user actually opened, so we can show a
 * "Recent" section at the top of the sidebar. No setup required — older
 * users get value immediately just by clicking around.
 */
const KEY = "jaza.recent-modules.v1";
const MAX = 5;

type Listener = () => void;
const listeners = new Set<Listener>();

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX)));
  } catch {
    /* localStorage may be disabled (incognito); silently ignore */
  }
  listeners.forEach((l) => l());
}

export function recordModuleVisit(id: string) {
  const current = read();
  const next = [id, ...current.filter((x) => x !== id)].slice(0, MAX);
  write(next);
}

export function clearRecentModules() {
  write([]);
}

/** React hook: returns the current list of recent module ids, reactive. */
export function useRecentModules(): string[] {
  const [snapshot, setSnapshot] = useState<string[]>(() => read());

  useEffect(() => {
    const sync = () => setSnapshot(read());
    listeners.add(sync);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return snapshot;
}
