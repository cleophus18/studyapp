import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { q } from "../database/connection.js";
import { forbidden, unauthorized } from "../utils/errors.js";

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

function extractToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

/** Requires a valid JWT and an active user. Attaches `req.user`. */
export function requireAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next(unauthorized());
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return next(
      unauthorized("Your session has expired. Please sign in again."),
    );
  }
  const user = q.get(
    "SELECT id, email, name, role, is_active, created_at FROM users WHERE id = ?",
    payload.sub,
  );
  if (!user || !user.is_active)
    return next(unauthorized("Account not found or disabled"));
  req.user = user;
  next();
}

/** Like requireAuth but does not fail if there is no token. */
export function optionalAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = q.get(
      "SELECT id, email, name, role, is_active FROM users WHERE id = ?",
      payload.sub,
    );
    if (user && user.is_active) req.user = user;
  } catch {
    /* ignore invalid token for optional auth */
  }
  next();
}

export function requireAdmin(req, _res, next) {
  if (!req.user) return next(unauthorized());
  if (req.user.role !== "admin")
    return next(forbidden("Admin access required"));
  next();
}
