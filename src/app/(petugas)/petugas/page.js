import { connection } from "next/server";
import { listUsers, listAccountAuditLogs } from "@/server/admin-accounts";
import { StaffManagement } from "@/features/accounts/StaffManagement";

export default async function StaffManagementPage() {
  await connection();
  const [users, auditLogs] = await Promise.all([listUsers(), listAccountAuditLogs()]);
  return <main className="flex w-full flex-col gap-4"><section><h2 className="font-display text-xl font-bold text-text sm:text-2xl">Kelola Petugas</h2><p className="mt-1 text-sm text-muted">Buat akun petugas dan kelola akses ke sistem perpustakaan.</p></section><StaffManagement users={users} auditLogs={auditLogs} /></main>;
}
