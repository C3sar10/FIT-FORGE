import { Request, Response, NextFunction } from "express";
import { verifyAccess } from "../lib/jwt";
import { errors } from "../utils/ApiError";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  let token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : req.cookies?.["ff_access"];
  if (!token) throw errors.authRequired();

  try {
    const payload = verifyAccess(token);
    (req as any).user = { userId: payload.sub };
    next();
  } catch {
    throw errors.authInvalid();
  }
}
