import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import crypto from "crypto";

import User from "../models/User";
import { signAccess, signRefresh, verifyRefresh } from "../lib/jwt";
import { isProd, env } from "../config/env";
import { ApiError, errors } from "../utils/ApiError";

const router = Router();

// --- helpers
const setAuthCookies = (res: any, access: string, refresh: string) => {
  res.cookie("ff_access", access, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    //domain: env.COOKIE_DOMAIN,
    path: "/",
    maxAge: env.ACCESS_TOKEN_TTL * 1000,
  });
  res.cookie("ff_refresh", refresh, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    //domain: env.COOKIE_DOMAIN,
    path: "/auth", // refresh cookie scoped to auth routes
    maxAge: env.REFRESH_TOKEN_TTL * 1000,
  });
};

const clearAuthCookies = (res: any) => {
  res.clearCookie("ff_access", { path: "/" });
  res.clearCookie("ff_refresh", { path: "/auth" });
};

// --- schemas
const RegisterSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

// --- routes
router.post("/register", async (req, res) => {
  const { name, email, password } = RegisterSchema.parse(req.body);

  const exists = await User.findOne({ email });
  if (exists) throw errors.conflict("Email already in use");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    providers: [],
    sessions: [],
  });

  const tokenId = crypto.randomUUID().toString();
  user.sessions.push({ tokenId });
  await user.save();

  const access = signAccess({ sub: user.id });
  const refresh = signRefresh({ sub: user.id, jti: tokenId });
  setAuthCookies(res, access, refresh);

  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

router.post("/login", async (req, res) => {
  const { email, password } = LoginSchema.parse(req.body);

  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) throw errors.authInvalid();

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw errors.authInvalid();

  const tokenId = crypto.randomUUID();
  user.sessions.push({ tokenId });
  await user.save();

  const access = signAccess({ sub: user.id });
  const refresh = signRefresh({ sub: user.id, jti: tokenId });
  setAuthCookies(res, access, refresh);

  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

router.get("/me", async (req, res) => {
  try {
    const access = req.cookies?.["ff_access"];
    if (!access) return res.json({ user: null });

    // quick verify without throwing 500s
    const { verifyAccess } = await import("../lib/jwt");
    const payload = verifyAccess(access);
    const user = await User.findById(payload.sub).select("name email");
    return res.json({
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
    });
  } catch {
    return res.json({ user: null });
  }
});

router.post("/refresh", async (req, res) => {
  const token = req.cookies?.["ff_refresh"];
  if (!token) throw errors.authInvalid();

  let payload: any;
  try {
    payload = verifyRefresh(token); // { sub, jti }
  } catch {
    throw errors.authInvalid();
  }

  const user = await User.findById(payload.sub);
  if (!user) throw errors.authInvalid();

  const exists = user.sessions.some((s) => s.tokenId === payload.jti);
  if (!exists) throw errors.authInvalid(); // revoked/rotated

  // rotate
  const newId = crypto.randomUUID();
  await User.updateOne(
    { _id: user._id },
    {
      $pull: { sessions: { tokenId: payload.jti } },
      $push: { sessions: { tokenId: newId, createdAt: new Date() } },
    }
  );

  const access = signAccess({ sub: user.id });
  const refresh = signRefresh({ sub: user.id, jti: newId });
  setAuthCookies(res, access, refresh);

  res.json({ ok: true });
});

router.post("/logout", async (req, res) => {
  const token = req.cookies?.["ff_refresh"];
  if (token) {
    try {
      const payload = verifyRefresh(token);
      const user = await User.findById(payload.sub);
      if (user) {
        await User.updateOne(
          { _id: user._id },
          {
            $pull: { sessions: { tokenId: payload.jti } },
          }
        );
      }
    } catch {
      /* ignore */
    }
  }
  clearAuthCookies(res);
  res.json({ ok: true });
});

// NOTE: you'll add POST /auth/sso later for Google/Apple handoff

export default router;
