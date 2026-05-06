import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { HTTPError } from "ky";
import { api } from "#/lib/api";

/** Resolved permissions returned by the API (PRD §6.1).
 * Keys are module ids (`"master" | "purchase" | "sales" | "inventory" | "ar"`); values are
 * `{ canEdit, canDelete }`. Reports is a string[] of allowed report types
 * (`"sales" | "inventory" | "purchase" | "ar"`).
 */
export interface ResolvedPermissions {
  modules: Record<string, { canEdit: boolean; canDelete: boolean }>;
  reports: string[];
  isDeveloper: boolean;
}

export type Theme = "light" | "dark" | "system";
export type TextSize = "small" | "normal" | "large" | "xlarge";

export interface UserPreferences {
  language: "id" | "en";
  textSize: TextSize;
  theme: Theme;
}

/** Identity portion of the /api/auth/me response. */
export interface CurrentUser {
  userId: string;
  /** Sign-in identifier displayed in the header. We treat email as the username. */
  username?: string;
  email: string;
  fullName: string;
  /** Single-role tuple (role names from the `Roles` constants on the backend). */
  roles: string[];
  mfaEnabled: boolean;
  mustChangePassword: boolean;
  isDeveloper: boolean;
}

/** Wire format for /api/auth/login and /api/auth/me responses. */
interface AuthApiUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isDeveloper: boolean;
  mfaEnabled: boolean;
  mustChangePassword: boolean;
}

interface MeResponse {
  user: AuthApiUser;
  permissions: ResolvedPermissions;
  preferences: UserPreferences;
}

interface LoginResponse extends MeResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
}

/** In-memory access token. We deliberately do NOT persist it to localStorage to keep XSS blast radius small. */
let accessToken: string | null = null;
/** Refresh token persisted in sessionStorage so a hard refresh of the SPA can re-acquire an access token. */
const REFRESH_KEY = "jaza.refresh.v1";

function readRefresh(): string | null {
  try { return sessionStorage.getItem(REFRESH_KEY); } catch { return null; }
}
function writeRefresh(token: string | null) {
  try {
    if (token) sessionStorage.setItem(REFRESH_KEY, token);
    else sessionStorage.removeItem(REFRESH_KEY);
  } catch { /* private mode */ }
}

/** Public — also used by the api client hook to attach the bearer header. */
export function getAccessToken(): string | null { return accessToken; }
export function setAccessToken(token: string | null) { accessToken = token; }

/** Refresh the access token using the saved refresh token. Returns true on success. */
export async function tryRefreshAccessToken(): Promise<boolean> {
  const refresh = readRefresh();
  if (!refresh) return false;
  try {
    const res = await api.post("auth/refresh", { json: { refreshToken: refresh } }).json<RefreshResponse>();
    accessToken = res.accessToken;
    writeRefresh(res.refreshToken);
    return true;
  } catch {
    accessToken = null;
    writeRefresh(null);
    return false;
  }
}

/** Translate an API user record into the shape consumed by UI components. */
function toCurrentUser(u: AuthApiUser): CurrentUser {
  return {
    userId: u.id,
    username: u.email,
    email: u.email,
    fullName: u.fullName,
    roles: [u.role],
    mfaEnabled: u.mfaEnabled,
    mustChangePassword: u.mustChangePassword,
    isDeveloper: u.isDeveloper,
  };
}

interface LoginInput {
  username: string; // email-style identifier
  password: string;
  mfaCode?: string;
}

/** Custom error so `LoginPage` can branch on lockout / MFA / generic failure. */
export class LoginError extends Error {
  constructor(public code: string, message: string) { super(message); }
}

interface AuthCtx {
  user: CurrentUser | null;
  permissions: ResolvedPermissions | null;
  preferences: UserPreferences | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Hot-update the cached preferences (used by SettingsProvider after a save). */
  updateLocalPreferences: (next: Partial<UserPreferences>) => void;
  /** Replace the auth snapshot after a self-service password change so the new tokens are remembered. */
  applyAuthSnapshot: (login: LoginResponse) => void;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [permissions, setPermissions] = useState<ResolvedPermissions | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  /** Avoid two refreshes in flight at once on initial mount + window focus. */
  const inflight = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    if (inflight.current) return inflight.current;
    const work = (async () => {
      try {
        // First try /me with whatever we have (cookie or in-memory access token).
        let me: MeResponse;
        try {
          me = await api.get("auth/me").json<MeResponse>();
        } catch (err) {
          if (err instanceof HTTPError && err.response.status === 401) {
            // Cookie expired / no session — try one bearer refresh before giving up.
            const ok = await tryRefreshAccessToken();
            if (!ok) throw err;
            me = await api.get("auth/me").json<MeResponse>();
          } else {
            throw err;
          }
        }
        setUser(toCurrentUser(me.user));
        setPermissions(me.permissions);
        setPreferences(me.preferences);
      } catch {
        setUser(null);
        setPermissions(null);
        setPreferences(null);
      } finally {
        setLoading(false);
      }
    })();
    inflight.current = work;
    try { await work; } finally { inflight.current = null; }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const login = useCallback(async ({ username, password, mfaCode }: LoginInput) => {
    try {
      const res = await api
        .post("auth/login", {
          json: { email: username.trim(), password, mfaCode: mfaCode ?? null },
        })
        .json<LoginResponse>();
      accessToken = res.accessToken;
      writeRefresh(res.refreshToken);
      setUser(toCurrentUser(res.user));
      setPermissions(res.permissions);
      setPreferences(res.preferences);
    } catch (err) {
      if (err instanceof HTTPError) {
        const body = await err.response.clone().json().catch(() => null) as { title?: string; detail?: string } | null;
        const code = body?.title ?? "login_failed";
        const detail = body?.detail ?? err.message;
        throw new LoginError(code, detail);
      }
      throw new LoginError("login_failed", "Sign in failed. Please check your connection and try again.");
    }
  }, []);

  const logout = useCallback(async () => {
    try { await api.post("auth/logout"); } catch { /* best effort */ }
    accessToken = null;
    writeRefresh(null);
    setUser(null);
    setPermissions(null);
    setPreferences(null);
  }, []);

  const updateLocalPreferences = useCallback((next: Partial<UserPreferences>) => {
    setPreferences((prev) => ({
      language: next.language ?? prev?.language ?? "id",
      textSize: next.textSize ?? prev?.textSize ?? "normal",
      theme: next.theme ?? prev?.theme ?? "light",
    }));
  }, []);

  const applyAuthSnapshot = useCallback((res: LoginResponse) => {
    accessToken = res.accessToken;
    writeRefresh(res.refreshToken);
    setUser(toCurrentUser(res.user));
    setPermissions(res.permissions);
    setPreferences(res.preferences);
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    user, permissions, preferences, loading,
    refresh, login, logout, updateLocalPreferences, applyAuthSnapshot,
  }), [user, permissions, preferences, loading, refresh, login, logout, updateLocalPreferences, applyAuthSnapshot]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}

// ─── Role / permission helpers ───────────────────────────────────────────────

export function hasRole(user: CurrentUser | null, ...roles: string[]) {
  return !!user && roles.some((r) => user.roles.includes(r));
}

/** True when the user can VIEW the given module (read-only is sufficient). */
export function canViewModule(perms: ResolvedPermissions | null, module: string): boolean {
  return !!perms && Object.prototype.hasOwnProperty.call(perms.modules, module);
}

/** True when the user can edit (create/update) within the given module. */
export function canEditModule(perms: ResolvedPermissions | null, module: string): boolean {
  return !!perms?.modules[module]?.canEdit;
}

/** True when the user can delete within the given module. */
export function canDeleteModule(perms: ResolvedPermissions | null, module: string): boolean {
  return !!perms?.modules[module]?.canDelete;
}

/** True when the user can view a given report type. */
export function canViewReport(perms: ResolvedPermissions | null, reportType: string): boolean {
  return !!perms?.reports.includes(reportType);
}

/** Convenience hooks. */
export function usePermissions() {
  return useAuth().permissions;
}

export function useModuleAccess(module: string) {
  const perms = usePermissions();
  return {
    canView: canViewModule(perms, module),
    canEdit: canEditModule(perms, module),
    canDelete: canDeleteModule(perms, module),
  };
}

export function useReportAccess(reportType: string) {
  const perms = usePermissions();
  return canViewReport(perms, reportType);
}
