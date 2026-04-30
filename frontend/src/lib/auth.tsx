import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STATIC_SESSION_KEY = "jaza-venus-static-auth-v1";

/** Temporary demo credentials (no API). */
const STATIC_USERNAME = "admin";
const STATIC_PASSWORD = "admin";

/** Session user shown after static login succeeds. */
const STATIC_USER: CurrentUser = {
  userId: "static-admin",
  username: STATIC_USERNAME,
  email: "",
  fullName: "Admin",
  roles: ["SuperAdmin"],
  mfaEnabled: false,
};

export interface CurrentUser {
  userId: string;
  /** Sign-in id when not using email (static demo uses this). */
  username?: string;
  email: string;
  fullName: string;
  roles: string[];
  mfaEnabled: boolean;
}

interface AuthCtx {
  user: CurrentUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(STATIC_SESSION_KEY) === "1") {
        setUser(STATIC_USER);
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const login = async (username: string, password: string) => {
    if (username.trim() !== STATIC_USERNAME || password !== STATIC_PASSWORD) {
      throw new Error("Invalid username or password.");
    }
    try {
      sessionStorage.setItem(STATIC_SESSION_KEY, "1");
    } catch {
      /* ignore quota / privacy mode */
    }
    setUser(STATIC_USER);
  };

  const logout = async () => {
    try {
      sessionStorage.removeItem(STATIC_SESSION_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, refresh, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}

export function hasRole(user: CurrentUser | null, ...roles: string[]) {
  return !!user && roles.some((r) => user.roles.includes(r));
}
