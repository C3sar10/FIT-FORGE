"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthAPI } from "@/lib/api";

type User = { id: string; name?: string; email: string } | null;

type AuthCtx = {
  user: User;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ user: User; accessToken: string; refreshToken: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ user: User; accessToken: string; refreshToken: string }>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // On app mount, check for refresh token and try to restore session
  useEffect(() => {
    const refreshToken =
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken");
    if (refreshToken) {
      (async () => {
        try {
          // Call refresh endpoint
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            }
          );
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem("accessToken", data.accessToken);
            setUser(data.user ?? null);
          } else {
            setUser(null);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            sessionStorage.removeItem("refreshToken");
          }
        } catch {
          setUser(null);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // bootstrap session on first mount
  useEffect(() => {
    (async () => {
      try {
        const data = await AuthAPI.me(); // { user: {...} | null } – uses Authorization if token exists
        setUser(data?.user ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await AuthAPI.login({ email, password }); // { user, accessToken, refreshToken }
    localStorage.setItem("accessToken", data.accessToken);
    // Don't set refreshToken here, let page.tsx handle it for rememberMe/session logic
    setUser(data.user); // update snapshot immediately
    return data;
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await AuthAPI.register({ name, email, password }); // { user, accessToken, refreshToken }
    localStorage.setItem("accessToken", data.accessToken);
    // Don't set refreshToken here, let page.tsx handle it for rememberMe/session logic
    setUser(data.user); // snapshot
    return data;
  };

  const logout = async () => {
    await AuthAPI.logout(); // Sends refreshToken in body
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
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
