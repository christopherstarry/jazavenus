import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type TextSize = "small" | "normal" | "large" | "xlarge";
export type Theme = "light" | "dark" | "system";

interface Settings {
  textSize: TextSize;
  theme: Theme;
}

interface SettingsCtx extends Settings {
  setTextSize: (s: TextSize) => void;
  setTheme: (t: Theme) => void;
}

const KEY = "jaza.settings.v1";
const DEFAULTS: Settings = { textSize: "normal", theme: "system" };

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULTS;
  }
}

function save(s: Settings) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    html.dataset.theme = prefersDark ? "dark" : "light";
  } else {
    html.dataset.theme = theme;
  }
}

function applyTextSize(s: TextSize) { document.documentElement.dataset.text = s; }

const Ctx = createContext<SettingsCtx | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Settings>(() => load());

  useEffect(() => { applyTheme(s.theme); applyTextSize(s.textSize); save(s); }, [s]);

  useEffect(() => {
    if (s.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [s.theme]);

  return (
    <Ctx.Provider value={{
      ...s,
      setTextSize: (v) => setS((p) => ({ ...p, textSize: v })),
      setTheme:    (v) => setS((p) => ({ ...p, theme: v })),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSettings must be used inside SettingsProvider");
  return v;
}
