import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

export interface CurrentUser {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  mfaEnabled: boolean;
}

interface AuthCtx {
  user: CurrentUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string, totpCode?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const me = await api.get("auth/me").json<CurrentUser>();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const login = async (email: string, password: string, totpCode?: string) => {
    await api.post("auth/login", { json: { email, password, totpCode } }).json();
    await refresh();
  };

  const logout = async () => {
    await api.post("auth/logout");
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
