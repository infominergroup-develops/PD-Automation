import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../src/types.js";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const MANAGEMENT_ROLES: UserRole[] = ["ADMIN", "MANAGER"];
export const MIN_PASSWORD_LENGTH = 8;

const TOKEN_TTL = "12h";
const BCRYPT_ROUNDS = 10;

// Resolved on first use: ES imports run before the entry point's dotenv.config()
let jwtSecret: string | null = null;
function getJwtSecret(): string {
  if (jwtSecret) return jwtSecret;
  const configured = process.env.JWT_SECRET;
  if (configured && (configured.length >= 32 || process.env.NODE_ENV !== "production")) {
    jwtSecret = configured;
  } else if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set to a random value of at least 32 characters in production");
  } else {
    console.warn("[Auth] JWT_SECRET not set; using a random dev secret (sessions reset on restart).");
    jwtSecret = crypto.randomBytes(32).toString("hex");
  }
  return jwtSecret;
}

export const hashPassword = (plain: string) => bcrypt.hash(plain, BCRYPT_ROUNDS);

const isBcryptHash = (value: string) => /^\$2[aby]\$\d{2}\$/.test(value);

/**
 * Checks a login password against the stored value. Accounts created before hashing was
 * introduced still hold plaintext; those match once and are flagged for re-hashing.
 */
export async function verifyPassword(plain: string, stored: unknown): Promise<{ ok: boolean; needsRehash: boolean }> {
  if (typeof stored !== "string" || !stored || !plain) return { ok: false, needsRehash: false };
  if (isBcryptHash(stored)) return { ok: await bcrypt.compare(plain, stored), needsRehash: false };

  const a = Buffer.from(plain);
  const b = Buffer.from(stored);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  return { ok, needsRehash: ok };
}

export const signToken = (user: AuthUser) =>
  jwt.sign({ name: user.name, email: user.email, role: user.role }, getJwtSecret(), { subject: user.id, expiresIn: TOKEN_TTL });

/** Strips credentials before a user record leaves the server. */
export function toPublicUser<T extends { password?: unknown }>(user: T): Omit<T, "password"> {
  const { password, ...rest } = user;
  return rest;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    const payload = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
    req.user = { id: payload.sub as string, name: payload.name, email: payload.email, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

export const requireRole = (...roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: "You do not have permission to perform this action" });
  }
  next();
};
