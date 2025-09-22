import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtAccess = { sub: string }; // user id
export type JwtRefresh = { sub: string; jti: string }; // refresh token id (session id)

export function signAccess(payload: JwtAccess) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
  });
}

export function signRefresh(payload: JwtRefresh) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL,
  });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccess & jwt.JwtPayload;
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefresh &
    jwt.JwtPayload;
}
