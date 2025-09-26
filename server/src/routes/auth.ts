import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import crypto from "crypto";

import User from "../models/User";
import { signAccess, signRefresh, verifyRefresh } from "../lib/jwt";
import { env } from "../config/env";
import { ApiError, errors } from "../utils/ApiError";

const router = Router();

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
  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    accessToken: access,
    refreshToken: refresh,
  });
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
  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    accessToken: access,
    refreshToken: refresh,
  });
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const access = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    if (!access) return res.json({ user: null });

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
  const { refreshToken } = req.body; // Expect refresh token in body
  console.log("Received refreshToken:", refreshToken);
  if (!refreshToken) {
    console.log("No refresh token provided");
    throw errors.authInvalid();
  }

  let payload: any;
  try {
    payload = verifyRefresh(refreshToken);
    console.log("Refresh token payload:", payload);
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
    throw errors.authInvalid();
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    console.log("User not found for refresh token");
    throw errors.authInvalid();
  }

  const exists = user.sessions.some((s) => s.tokenId === payload.jti);
  if (!exists) {
    console.log("Refresh token session not found");
    throw errors.authInvalid(); // revoked/rotated
  }

  // rotate
  const newId = crypto.randomUUID();
  // First, remove the old session
  await User.updateOne(
    { _id: user._id },
    { $pull: { sessions: { tokenId: payload.jti } } }
  );
  // Then, add the new session
  await User.updateOne(
    { _id: user._id },
    { $push: { sessions: { tokenId: newId, createdAt: new Date() } } }
  );

  const access = signAccess({ sub: user.id });
  const refresh = signRefresh({ sub: user.id, jti: newId });
  res.json({
    accessToken: access,
    refreshToken: refresh,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body; // Expect refresh token in body
  if (refreshToken) {
    try {
      const payload = verifyRefresh(refreshToken);
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
  res.json({ ok: true });
});

export default router;
