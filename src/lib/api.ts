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
    // @ts-expect-error stash status/code for UI logic if you want
    err.status = res.status;
    throw err;
  }
  return res;
}

export async function api(path: string, init: RequestInit = {}) {
  try {
    return await request(path, init);
  } catch (err: any) {
    // if 401 on non-auth route, try one refresh then retry
    if (err?.status === 401 && !path.startsWith("/auth/")) {
      await request("/auth/refresh", { method: "POST" });
      return request(path, init);
    }
    throw err;
  }
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
