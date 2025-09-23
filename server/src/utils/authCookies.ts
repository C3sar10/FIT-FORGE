// utils/authCookies.ts
import { Response } from "express";

export function setAuthCookies(res: Response, access: string, refresh: string) {
  const month = 1000 * 60 * 60 * 24 * 30;

  // short-lived access (e.g., 15m)
  res.cookie("ff_access", access, {
    httpOnly: true,
    secure: true, // required for SameSite=None
    sameSite: "none", // cross-site: vercel.app -> onrender.com
    path: "/", // send to all endpoints (incl. /workouts)
    maxAge: 15 * 60 * 1000,
  });

  // long-lived refresh (e.g., 30d)
  res.cookie("ff_refresh", refresh, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/auth/refresh", // only sent to refresh
    maxAge: month,
  });
}
