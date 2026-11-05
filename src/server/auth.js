import "server-only";
import { cache } from "react";
import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE = "smart_library_session";
const SESSION_MS = 8 * 60 * 60 * 1000;
const hashToken = (token) => createHash("sha256").update(token).digest("hex");
const cookieOptions = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MS / 1000 };

export async function authenticateUser({ username, password }) {
  const safeUsername = typeof username === "string" ? username.trim().slice(0, 64) : "";
  const safePassword = typeof password === "string" ? password : "";
  const user = safeUsername ? await db("users as u").join("roles as r", "r.id", "u.role_id").select("u.id", "u.username", "u.name", "u.password_hash", "u.is_active", "r.name as role").whereRaw("lower(u.username) = lower(?)", [safeUsername]).first() : null;
  let valid = false;
  try { valid = await argon2.verify(user?.password_hash || DUMMY_HASH, safePassword); } catch { valid = false; }
  if (!user || !user.is_active || !valid) return null;
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MS);
  await db("sessions").insert({ user_id: user.id, token_hash: hashToken(token), expires_at: expiresAt });
  (await cookies()).set(COOKIE, token, cookieOptions);
  return { id: user.id, username: user.username, name: user.name, role: user.role, expiresAt };
}

// Fixed Argon2 hash keeps unknown-user attempts on the same expensive verify path.
const DUMMY_HASH = "$argon2id$v=19$m=65536,p=4,t=3$1roC/GKTjHuU6dBoOJW7lw$qPUNucfXb9zMEce1ppN1PezD3dcPFrS6VbYgw5yHqV4";

export const getCurrentUser = cache(async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{40,50}$/.test(token)) return null;
  const record = await db("sessions as s").join("users as u", "u.id", "s.user_id").join("roles as r", "r.id", "u.role_id")
    .select("u.id", "u.username", "u.name", "u.is_active", "r.name as role", "s.expires_at")
    .where("s.token_hash", hashToken(token)).whereNull("s.revoked_at").where("s.expires_at", ">", db.fn.now()).first();
  if (!record || !record.is_active) return null;
  return { id: record.id, username: record.username, name: record.name, role: record.role, expiresAt: record.expires_at };
});

export async function requireUser(allowedRoles) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (allowedRoles && ![].concat(allowedRoles).includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

export async function revokeCurrentSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token && /^[A-Za-z0-9_-]{40,50}$/.test(token)) await db("sessions").where({ token_hash: hashToken(token) }).whereNull("revoked_at").update({ revoked_at: db.fn.now() });
  jar.set(COOKIE, "", { ...cookieOptions, maxAge: 0 });
}
