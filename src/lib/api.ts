// src/lib/api.ts
import { ExerciseApiType } from "@/types/workout";

const BASE = process.env.NEXT_PUBLIC_API_URL!;

function buildInit(init: RequestInit = {}): RequestInit {
  const hasBody = typeof init.body !== "undefined" && init.body !== null;
  const headers = new Headers(init.headers || undefined);
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return {
    // Always CORS + send cookies cross-site (vercel -> render)
    mode: "cors",
    credentials: "include",
    ...init,
    headers,
  };
}

async function request(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, buildInit(init));

  if (!res.ok) {
    let msg = "Request failed";
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {}
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res;
}

export async function api(path: string, init: RequestInit = {}) {
  try {
    return await request(path, init);
  } catch (err: any) {
    // On 401, try a one-shot refresh, then retry original (cookies included both times)
    if (err?.status === 401 && !path.startsWith("/auth/")) {
      await request("/auth/refresh", { method: "POST" });
      return request(path, init);
    }
    throw err;
  }
}

// ---------- helpers ----------
async function safeJson<T = any>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as unknown as T;
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

export async function apiJson<T = any>(path: string, init: RequestInit = {}) {
  const res = await api(path, init);
  return safeJson<T>(res);
}

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

// ---------- existing usage ----------
export async function fetchMine(limit = 20, cursor?: string) {
  const params = new URLSearchParams({ scope: "mine", limit: String(limit) });
  if (cursor) params.append("cursor", cursor);
  const res = await api(`/exercises?${params.toString()}`);
  return (await res.json()) as {
    items: ExerciseApiType[];
    nextCursor: string | null;
  };
}

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
