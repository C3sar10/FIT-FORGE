// src/lib/api.ts
import { WorkoutLogType } from "@/types/progress";
import { ExerciseType } from "@/types/workout";

const BASE = process.env.NEXT_PUBLIC_API_URL!;
if (!BASE) {
  // Provide a clearer runtime error in dev when the API base URL isn't configured
  // This avoids silent fetch to an invalid URL which often appears as a 404.
  // eslint-disable-next-line no-console
  console.error(
    "NEXT_PUBLIC_API_URL is not set. API calls will fail. Set NEXT_PUBLIC_API_URL in your environment."
  );
}

function buildInit(path: string, init: RequestInit = {}): RequestInit {
  const hasBody = typeof init.body !== "undefined" && init.body !== null;
  const headers = new Headers(init.headers || undefined);
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Add Authorization header if accessToken exists and not an auth route
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const isAuthPath = path.startsWith("/auth/");
  if (accessToken && !isAuthPath) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return {
    mode: "cors",
    // No credentials: 'include' – we're using Bearer now
    ...init,
    headers,
  };
}

async function request(path: string, init: RequestInit = {}) {
  const url = `${BASE}${path}`;
  // Helpful debug: print the full URL in dev when debugging 404s
  if (typeof window !== "undefined" && (!BASE || BASE.indexOf("http") !== 0)) {
    // eslint-disable-next-line no-console
    console.warn("API base URL may be misconfigured:", BASE, "full path:", url);
  }
  const res = await fetch(url, buildInit(path, init));

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
    // On 401, try a one-shot refresh, then retry original
    if (err?.status === 401 && !path.startsWith("/auth/")) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw err; // No refresh possible
      const refreshRes = await request("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
      const { accessToken: newAccess, refreshToken: newRefresh } =
        await refreshRes.json();
      localStorage.setItem("accessToken", newAccess);
      localStorage.setItem("refreshToken", newRefresh);
      return request(path, init); // Retry with new token (header added in buildInit)
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
    items: ExerciseType[];
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
  logout: () => {
    const refreshToken =
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken");
    return api("/auth/logout", {
      method: "POST",
      body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
    }).then((r) => r.json());
  },
  updateUser: (body: {
    id: string;
    name?: string;
    email?: string;
    phone?: {
      e164?: string;
      verified?: boolean;
    };
    gender?: string;
    dob?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipcode?: string;
      country?: string;
    };
    height?: {
      value?: number;
      unit?: string;
    };
    weight?: {
      value?: number;
      unit?: string;
    };
  }) =>
    api(`/auth/${body.id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((r) => r.json()),
};

export const LogAPI = {
  getLogs: (
    limit = 100,
    cursor?: string,
    fromDate?: string,
    toDate?: string
  ) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    return api(`/workoutLogs?${params.toString()}`).then((r) => r.json());
  },
  getLog: (id: string) => api(`/workoutLogs/${id}`).then((r) => r.json()),
  createLog: (body: WorkoutLogType) =>
    api("/workoutLogs", { method: "POST", body: JSON.stringify(body) }).then(
      (r) => r.json()
    ),
  updateLog: (id: string, body: Partial<WorkoutLogType>) =>
    api(`/workoutLogs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  deleteLog: (id: string) => api(`/workoutLogs/${id}`, { method: "DELETE" }),
};

// --------- Events API ----------
export const EventAPI = {
  list: (
    scope: "mine" | "all" = "mine",
    limit = 100,
    cursor?: string,
    query?: string
  ) => {
    const params = new URLSearchParams({ scope, limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    if (query) params.append("query", query);
    return api(`/events?${params.toString()}`).then((r) => r.json());
  },
  get: (id: string) => api(`/events/${id}`).then((r) => r.json()),
  create: (body: any) =>
    api("/events", { method: "POST", body: JSON.stringify(body) }).then((r) =>
      r.json()
    ),
  update: (id: string, body: Partial<any>) =>
    api(`/events/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(
      (r) => r.json()
    ),
  delete: (id: string) => api(`/events/${id}`, { method: "DELETE" }),
  // Fetch events for a specific date (mine only)
  listByDate: (date: string, limit = 20, cursor?: string) => {
    const params = new URLSearchParams({
      scope: "mine",
      limit: String(limit),
      date,
    });
    if (cursor) params.append("cursor", cursor);
    return api(`/events?${params.toString()}`).then((r) => r.json());
  },
  // Fetch events for a specific month (mine only)
  listByMonth: (year: number, month: number, limit = 100, cursor?: string) => {
    // month: 1-12
    const params = new URLSearchParams({
      scope: "mine",
      limit: String(limit),
      year: String(year),
      month: String(month),
    });
    if (cursor) params.append("cursor", cursor);
    return api(`/events?${params.toString()}`).then((r) => r.json());
  },
};
