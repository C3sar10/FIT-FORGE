import { ExerciseApiType } from "@/types/workout";

// src/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_URL!;

async function request(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });

  if (!res.ok) {
    let msg = "Request failed";
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {}
    const err = new Error(msg);
    // @ts-expect-error surface status for UI logic
    err.status = res.status;
    throw err;
  }
  return res;
}

export async function api(path: string, init: RequestInit = {}) {
  try {
    return await request(path, init);
  } catch (err: any) {
    if (err?.status === 401 && !path.startsWith("/auth/")) {
      await request("/auth/refresh", { method: "POST" });
      return request(path, init);
    }
    throw err;
  }
}

export async function fetchMine(limit = 20, cursor?: string) {
  const params = new URLSearchParams({
    scope: "mine",
    limit: String(limit),
  });
  if (cursor) params.append("cursor", cursor);

  const res = await api(`/exercises?${params.toString()}`);
  const data = await res.json();
  return data as { items: ExerciseApiType[]; nextCursor: string | null };
}

/** ---------- NEW: small helpers (no breaking changes) ---------- */

// Tolerant JSON parse (handles 204/empty bodies)
async function safeJson<T = any>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as unknown as T;
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

// Generic JSON fetcher (GET/POST/etc.) -> parsed JSON
export async function apiJson<T = any>(path: string, init: RequestInit = {}) {
  const res = await api(path, init);
  return safeJson<T>(res);
}

// Shorthands for common verbs with JSON bodies
export const http = {
  get: <T = any>(path: string) => api(path).then(safeJson<T>),
  post: <T = any>(path: string, body?: unknown) =>
    api(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }).then(safeJson<T>),
  put: <T = any>(path: string, body?: unknown) =>
    api(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }).then(safeJson<T>),
  patch: <T = any>(path: string, body?: unknown) =>
    api(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }).then(safeJson<T>),
  del: <T = any>(path: string) =>
    api(path, { method: "DELETE" }).then(safeJson<T>),
};

/** ---------- existing auth helpers unchanged (can use http.* if you want) ---------- */
export const AuthAPI = {
  me: () => api("/auth/me").then((r) => r.json()),
  register: (body: { name: string; email: string; password: string }) =>
    api("/auth/register", { method: "POST", body: JSON.stringify(body) }).then(
      (r) => r.json()
    ),
  login: (body: { email: string; password: string }) =>
    api("/auth/login", { method: "POST", body: JSON.stringify(body) }).then(
      (r) => r.json()
    ),
  logout: () => api("/auth/logout", { method: "POST" }).then((r) => r.json()),
};
