import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import i18n from "#/i18n";
import { api } from "#/lib/api";
import { useAuth, type TextSize, type Theme, type UserPreferences } from "#/lib/auth";

export type { TextSize, Theme };

interface Settings {
  textSize: TextSize;
  theme: Theme;
  language: "id" | "en";
}

interface SettingsCtx extends Settings {
  setTextSize: (s: TextSize) => void;
  setTheme: (t: Theme) => void;
  setLanguage: (l: Settings["language"]) => void;
}

const KEY = "jaza.settings.v1";
const DEFAULTS: Settings = { textSize: "normal", theme: "light", language: "id" };

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
  const { user, preferences, updateLocalPreferences } = useAuth();

  const [s, setS] = useState<Settings>(() => load());
  /** Track whether the user just changed a setting (so we know to PUT). When the change came
   * from server-side preferences sync, we only update local state and do NOT post back. */
  const remoteSyncRef = useRef(false);

  // When the API returns the signed-in user's preferences, hydrate local state without
  // re-posting them. This guarantees the SPA always reflects what the server thinks is true.
  useEffect(() => {
    if (!user || !preferences) return;
    remoteSyncRef.current = true;
    setS({
      language: (preferences.language as Settings["language"]) ?? DEFAULTS.language,
      textSize: preferences.textSize as TextSize,
      theme: preferences.theme as Theme,
    });
  }, [user, preferences]);

  // Apply UI side-effects + persist to localStorage, and (when authenticated) to the API.
  useEffect(() => {
    applyTheme(s.theme);
    applyTextSize(s.textSize);
    save(s);
    if (i18n.language !== s.language) void i18n.changeLanguage(s.language);

    if (remoteSyncRef.current) {
      remoteSyncRef.current = false;
      return;
    }
    if (!user) return; // anonymous: localStorage is the only source of truth.

    const payload: Partial<UserPreferences> = {
      language: s.language,
      textSize: s.textSize,
      theme: s.theme,
    };
    void api
      .put("auth/preferences", { json: payload })
      .json<UserPreferences>()
      .then((next) => updateLocalPreferences(next))
      .catch(() => { /* silent; localStorage already saved */ });
  }, [s, user, updateLocalPreferences]);

  // React to OS-level theme changes when "system" is selected.
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
      setLanguage: (v) => setS((p) => ({ ...p, language: v })),
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
