import "server-only";
import argon2 from "argon2";
import { db } from "@/lib/db";
import { requireUser } from "@/server/auth";
import { accountId, accountName, accountPassword, accountUsername, assertCanDeactivate, AccountInputError } from "@/server/admin-account-validation";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";

const ACCOUNT_LOCK = 741029;
const audit = (trx, actorId, action, userId, details = {}) => trx("audit_logs").insert({
  user_id: actorId, action, entity_type: "user", entity_id: String(userId), details,
});
const revokeSessions = (trx, userId) => trx("sessions").where({ user_id: userId }).whereNull("revoked_at").update({ revoked_at: trx.fn.now() });
const lockAccounts = (trx) => trx.raw("SELECT pg_advisory_xact_lock(?)", [ACCOUNT_LOCK]);
const sessionCookieName = "smart_library_session";
const hashToken = (token) => createHash("sha256").update(token).digest("hex");

export async function createPetugas(input) {
  const actor = await requireUser(["superadmin"]);
  const username = accountUsername(input?.username);
  const name = accountName(input?.name);
  const password = accountPassword(input?.password);
  const passwordHash = await argon2.hash(password);
  try {
    return await db.transaction(async (trx) => {
      await lockAccounts(trx);
      if (await trx("users").whereRaw("lower(username) = lower(?)", [username]).first("id")) throw new AccountInputError("Username sudah digunakan");
      const role = await trx("roles").where({ name: "petugas" }).first("id");
      if (!role) throw new Error("Role petugas belum tersedia");
      const [user] = await trx("users").insert({ role_id: role.id, username, name, password_hash: passwordHash }).returning(["id", "username", "name", "is_active"]);
      await audit(trx, actor.id, "user.created", user.id, { username: user.username, role: "petugas" });
      return user;
    });
  } catch (error) {
    if (error.code === "23505") throw new AccountInputError("Username sudah digunakan");
    throw error;
  }
}

export async function listUsers() {
  await requireUser(["superadmin"]);
  return db("users as u").join("roles as r", "r.id", "u.role_id")
    .select("u.id", "u.username", "u.name", "u.is_active", "u.created_at", "u.updated_at", "r.name as role")
    .orderBy("u.id", "asc");
}

export async function listAccountAuditLogs() {
  await requireUser(["superadmin"]);
  return db("audit_logs as a").leftJoin("users as u", "u.id", "a.user_id")
    .select("a.id", "a.action", "a.entity_type", "a.entity_id", "a.details", "a.created_at", "u.username as actor_username")
    .where("a.entity_type", "user").orderBy("a.created_at", "desc").orderBy("a.id", "desc").limit(200);
}

export async function setUserActive(userId, isActive) {
  const actor = await requireUser(["superadmin"]);
  const id = accountId(userId);
  if (typeof isActive !== "boolean") throw new AccountInputError("Status akun tidak valid");
  return db.transaction(async (trx) => {
    await lockAccounts(trx);
    const target = await trx("users as u").join("roles as r", "r.id", "u.role_id")
      .select("u.id", "u.username", "u.is_active", "r.name as role").where("u.id", id).forUpdate("u").first();
    if (!target) throw new AccountInputError("Akun tidak ditemukan");
    if (!isActive) {
      const count = target.role === "superadmin" ? await trx("users as u").join("roles as r", "r.id", "u.role_id")
        .where("r.name", "superadmin").where("u.is_active", true).count({ count: "u.id" }).first() : { count: 0 };
      assertCanDeactivate(target, actor.id, Number(count.count));
    }
    if (target.is_active === isActive) return { id: target.id, is_active: isActive };
    await trx("users").where({ id: target.id }).update({ is_active: isActive, updated_at: trx.fn.now() });
    if (!isActive) await revokeSessions(trx, target.id);
    await audit(trx, actor.id, isActive ? "user.activated" : "user.deactivated", target.id, { username: target.username });
    return { id: target.id, is_active: isActive };
  });
}

export async function resetUserPassword(userId, newPassword) {
  const actor = await requireUser(["superadmin"]);
  const id = accountId(userId);
  const passwordHash = await argon2.hash(accountPassword(newPassword));
  return db.transaction(async (trx) => {
    await lockAccounts(trx);
    const target = await trx("users").select("id", "username").where({ id }).forUpdate().first();
    if (!target) throw new AccountInputError("Akun tidak ditemukan");
    await trx("users").where({ id: target.id }).update({ password_hash: passwordHash, updated_at: trx.fn.now() });
    await revokeSessions(trx, target.id);
    await audit(trx, actor.id, "user.password_reset", target.id, { username: target.username });
    return { id: target.id };
  });
}

export async function updateOwnProfile(input) {
  const actor = await requireUser(["superadmin", "petugas"]);
  const name = accountName(input?.name);
  return db.transaction(async (trx) => {
    const target = await trx("users").select("id", "name").where({ id: actor.id }).forUpdate().first();
    if (!target) throw new AccountInputError("Akun tidak ditemukan");
    if (target.name !== name) {
      await trx("users").where({ id: actor.id }).update({ name, updated_at: trx.fn.now() });
      await audit(trx, actor.id, "user.profile_updated", actor.id, { fields: ["name"] });
    }
    return { id: actor.id, name };
  });
}

export async function changeOwnPassword(currentPassword, newPassword) {
  const actor = await requireUser(["superadmin", "petugas"]);
  if (typeof currentPassword !== "string" || !currentPassword || currentPassword.length > 1024) throw new AccountInputError("Kata sandi saat ini tidak valid");
  const password = accountPassword(newPassword);
  const target = await db("users").select("password_hash").where({ id: actor.id }).first();
  if (!target || !(await argon2.verify(target.password_hash, currentPassword))) throw new AccountInputError("Kata sandi saat ini salah");
  const passwordHash = await argon2.hash(password);
  const jar = await cookies();
  const token = jar.get(sessionCookieName)?.value;
  if (!token || !/^[A-Za-z0-9_-]{40,50}$/.test(token)) throw new Error("UNAUTHENTICATED");
  const currentTokenHash = hashToken(token);
  return db.transaction(async (trx) => {
    const locked = await trx("users").select("password_hash").where({ id: actor.id }).forUpdate().first();
    if (!locked || locked.password_hash !== target.password_hash) throw new AccountInputError("Kata sandi berubah; coba lagi");
    await trx("users").where({ id: actor.id }).update({ password_hash: passwordHash, updated_at: trx.fn.now() });
    await trx("sessions").where({ user_id: actor.id }).whereNull("revoked_at").whereNot("token_hash", currentTokenHash).update({ revoked_at: trx.fn.now() });
    await audit(trx, actor.id, "user.password_changed", actor.id);
    return { id: actor.id };
  });
}

export async function revokeOtherSessions() {
  const actor = await requireUser(["superadmin", "petugas"]);
  const jar = await cookies();
  const token = jar.get(sessionCookieName)?.value;
  if (!token || !/^[A-Za-z0-9_-]{40,50}$/.test(token)) throw new Error("UNAUTHENTICATED");
  const currentTokenHash = hashToken(token);
  return db.transaction(async (trx) => {
    const count = await trx("sessions").where({ user_id: actor.id }).whereNull("revoked_at").whereNot("token_hash", currentTokenHash).update({ revoked_at: trx.fn.now() });
    if (count) await audit(trx, actor.id, "user.other_sessions_revoked", actor.id, { count: Number(count) });
    return { revoked: Number(count) };
  });
}

export async function revokeUserSessions(userId) {
  const actor = await requireUser(["superadmin"]);
  const id = accountId(userId);
  return db.transaction(async (trx) => {
    await lockAccounts(trx);
    const target = await trx("users").select("id", "username").where({ id }).forUpdate().first();
    if (!target) throw new AccountInputError("Akun tidak ditemukan");
    const count = await revokeSessions(trx, id);
    await audit(trx, actor.id, "user.sessions_revoked", id, { username: target.username, count: Number(count) });
    return { id, revoked: Number(count) };
  });
}
