"use server";

import {
  changeOwnPassword,
  createPetugas,
  listUsers,
  listAccountAuditLogs,
  resetUserPassword,
  revokeOtherSessions,
  revokeUserSessions,
  setUserActive,
  updateOwnProfile,
} from "@/server/admin-accounts";
import { accountActiveState, AccountInputError } from "@/server/admin-account-validation";

async function run(operation) {
  try { return { data: await operation() }; }
  catch (error) {
    if (error instanceof AccountInputError) return { error: error.message };
    throw error;
  }
}

export async function updateOwnProfileAction(formData) {
  return run(() => updateOwnProfile({ name: formData.get("name") }));
}

export async function changeOwnPasswordAction(formData) {
  return run(() => {
    const newPassword = formData.get("newPassword");
    if (newPassword !== formData.get("confirmPassword")) throw new AccountInputError("Konfirmasi kata sandi baru tidak cocok");
    return changeOwnPassword(formData.get("currentPassword"), newPassword);
  });
}

export async function revokeOtherSessionsAction() {
  return run(revokeOtherSessions);
}

export async function listUsersAction() {
  return run(listUsers);
}

export async function listAccountAuditLogsAction() {
  return run(listAccountAuditLogs);
}

export async function createPetugasAction(formData) {
  return run(() => createPetugas({ username: formData.get("username"), name: formData.get("name"), password: formData.get("password") }));
}

export async function setUserActiveAction(formData) {
  return run(() => setUserActive(formData.get("userId"), accountActiveState(formData.get("isActive"))));
}

export async function resetUserPasswordAction(formData) {
  return run(() => resetUserPassword(formData.get("userId"), formData.get("newPassword")));
}

export async function revokeUserSessionsAction(formData) {
  return run(() => revokeUserSessions(formData.get("userId")));
}
