"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthAPI } from "@/lib/api";

type User = { id: string; name?: string; email: string } | null;

type AuthCtx = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // bootstrap session on first mount
  useEffect(() => {
    (async () => {
      try {
        const data = await AuthAPI.me(); // { user: {...} | null }
        setUser(data?.user ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await AuthAPI.login({ email, password }); // sets cookies
    setUser(data.user); // update snapshot immediately
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await AuthAPI.register({ name, email, password }); // sets cookies
    setUser(data.user); // snapshot
  };

  const logout = async () => {
    await AuthAPI.logout();
    setUser(null);
  };

  const refreshMe = async () => {
    const data = await AuthAPI.me();
    setUser(data?.user ?? null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refreshMe }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
