import { positiveId } from "./validation.js";

export class AccountInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "AccountInputError";
  }
}

export function accountName(value) {
  if (typeof value !== "string") throw new AccountInputError("Nama harus 2-160 karakter");
  const name = value.trim();
  if (name.length < 2 || name.length > 160 || /[\u0000-\u001f\u007f]/.test(name)) throw new AccountInputError("Nama harus 2-160 karakter");
  return name;
}

export function accountUsername(value) {
  if (typeof value !== "string") throw new AccountInputError("Username harus 3-64 karakter: huruf, angka, titik, garis bawah, atau strip");
  const username = value.trim();
  if (!/^[a-zA-Z0-9._-]{3,64}$/.test(username)) throw new AccountInputError("Username harus 3-64 karakter: huruf, angka, titik, garis bawah, atau strip");
  return username;
}

export function accountPassword(value) {
  if (typeof value !== "string" || value.length < 12 || value.length > 128 || !/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
    throw new AccountInputError("Password wajib 12-128 karakter dan mengandung huruf kecil, huruf besar, serta angka");
  }
  return value;
}

export function accountActiveState(value) {
  if (value !== "true" && value !== "false") throw new AccountInputError("Status akun tidak valid");
  return value === "true";
}

export function accountId(value) {
  try {
    return positiveId(value, "Akun");
  } catch {
    throw new AccountInputError("Akun tidak valid");
  }
}

export function assertCanDeactivate(target, actorId, activeSuperadmins) {
  if (String(target.id) === String(actorId)) throw new AccountInputError("Anda tidak dapat menonaktifkan akun sendiri");
  if (target.role === "superadmin" && target.is_active && activeSuperadmins <= 1) throw new AccountInputError("Superadmin aktif terakhir tidak dapat dinonaktifkan");
}
