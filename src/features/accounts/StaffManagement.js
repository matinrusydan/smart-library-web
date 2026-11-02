"use client";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Panel } from "@/components/ui/Panel";
import { createPetugasAction, setUserActiveAction, resetUserPasswordAction, revokeUserSessionsAction } from "@/app/actions/admin-accounts";

const date = value => value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value)) : "—";
function Result({ state }) { return state?.error ? <p role="alert" className="text-sm text-danger">{state.error}</p> : state?.data ? <p role="status" className="text-sm text-success">Berhasil disimpan.</p> : null; }

export function StaffManagement({ users, auditLogs }) {
  const router = useRouter();
  const [createState, createAction, creating] = useActionState(async (_previous, formData) => { const result = await createPetugasAction(formData); if (result?.data) router.refresh(); return result; }, null);
  const [activeResults, setActiveResults] = useState({});
  const [sessionResults, setSessionResults] = useState({});
  const [target, setTarget] = useState(null);
  const [resetState, resetAction, resetting] = useActionState(async (_previous, formData) => { const result = await resetUserPasswordAction(formData); if (result?.data) router.refresh(); return result; }, null);
  const staff = users.filter(user => user.role === "petugas");
  const columns = [
    { key: "name", label: "Nama" }, { key: "username", label: "Username" },
    { key: "status", label: "Status", render: row => <Badge tone={row.is_active ? "success" : "danger"}>{row.is_active ? "Aktif" : "Nonaktif"}</Badge> },
    { key: "created", label: "Dibuat", render: row => date(row.created_at) },
    { key: "actions", label: "Tindakan", render: row => <div className="flex flex-wrap items-start gap-2"><form action={async data => { const result = await setUserActiveAction(data); setActiveResults(previous => ({ ...previous, [row.id]: result })); if (result?.data) router.refresh(); }}><input type="hidden" name="userId" value={row.id}/><input type="hidden" name="isActive" value={String(!row.is_active)}/><Button size="sm" variant="ghost" type="submit">{row.is_active ? "Nonaktifkan" : "Aktifkan"}</Button>{activeResults[row.id]?.error && <span className="block text-sm text-danger" role="alert">{activeResults[row.id].error}</span>}</form><Button type="button" size="sm" variant="ghost" onClick={() => { setTarget(row); }}>Atur ulang sandi</Button><form action={async data => { const result = await revokeUserSessionsAction(data); setSessionResults(previous => ({ ...previous, [row.id]: result })); if (result?.data) router.refresh(); }}><input type="hidden" name="userId" value={row.id}/><Button size="sm" variant="ghost" type="submit">Akhiri sesi</Button>{sessionResults[row.id]?.error && <span className="block text-sm text-danger" role="alert">{sessionResults[row.id].error}</span>}</form></div> },
  ];
  return <div className="flex flex-col gap-4">
    <Panel title="Buat akun petugas"><form action={createAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
      <Field label="Nama lengkap" id="new-staff-name" name="name" minLength={2} maxLength={160} required />
      <Field label="Username" id="new-staff-username" name="username" minLength={3} maxLength={64} autoComplete="username" required />
      <Field label="Kata sandi sementara" id="new-staff-password" name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" aria-describedby="staff-password-policy" required />
      </div>
      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="staff-password-policy" className="text-sm text-muted">Kata sandi sementara: 12–128 karakter, termasuk huruf besar, huruf kecil, dan angka.</p>
        <Button type="submit" className="shrink-0" disabled={creating}>{creating ? "Membuat…" : "Buat akun"}</Button>
      </div>
      {(createState?.error || createState?.data) && <Result state={createState}/>}
    </form></Panel>
    <Panel title={`Petugas (${staff.length})`}>{staff.length ? <DataTable columns={columns} rows={staff} getRowKey={row => row.id}/> : <p className="py-10 text-center text-sm text-muted">Belum ada akun petugas.</p>}</Panel>
    <Panel title="Riwayat aktivitas akun">{auditLogs.length ? <DataTable columns={[{key:"action",label:"Aktivitas"},{key:"actor",label:"Dilakukan oleh",render:row=>row.actor_username||"Akun tidak tersedia"},{key:"entity",label:"ID akun",render:row=>row.entity_id},{key:"created",label:"Waktu",render:row=>date(row.created_at)}]} rows={auditLogs} getRowKey={row=>row.id}/> : <p className="py-10 text-center text-sm text-muted">Belum ada aktivitas akun.</p>}</Panel>
    <Modal open={Boolean(target)} onClose={() => { setTarget(null); }} title={`Atur ulang sandi${target ? ` · ${target.name}` : ""}`}>
      <form action={resetAction} className="flex flex-col gap-4"><input type="hidden" name="userId" value={target?.id ?? ""}/><Field label="Kata sandi baru" id="reset-password" hint="12+ karakter, dengan huruf besar, kecil, dan angka." name="newPassword" type="password" minLength={12} maxLength={128} autoComplete="new-password" required /><Result state={resetState}/><div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setTarget(null)}>Batal</Button><Button type="submit" disabled={resetting}>{resetting ? "Menyimpan…" : "Simpan kata sandi"}</Button></div></form>
    </Modal>
  </div>;
}
