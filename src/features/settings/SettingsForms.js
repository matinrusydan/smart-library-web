"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { updateOwnProfileAction, changeOwnPasswordAction, revokeOtherSessionsAction } from "@/app/actions/admin-accounts";

function SubmitResult({ state }) {
  return state?.error ? <p className="text-sm text-danger" role="alert">{state.error}</p> : state?.data ? <p className="text-sm text-success" role="status">Perubahan berhasil disimpan.</p> : null;
}

export function SettingsForms({ user }) {
  const [profile, profileAction, profilePending] = useActionState((_previous, formData) => updateOwnProfileAction(formData), null);
  const [password, passwordAction, passwordPending] = useActionState((_previous, formData) => changeOwnPasswordAction(formData), null);
  const [sessions, sessionsAction, sessionsPending] = useActionState(() => revokeOtherSessionsAction(), null);
  return <div className="grid w-full grid-cols-1 gap-4 xl:grid-cols-2">
    <Panel title="Ubah Password" className="p-5 sm:p-6">
      <form action={passwordAction} className="flex flex-col gap-4">
        <Field label="Kata sandi saat ini" id="current-password" name="currentPassword" type="password" autoComplete="current-password" required />
        <Field label="Kata sandi baru" id="new-password" hint="12–128 karakter, dengan huruf kecil, huruf besar, dan angka." name="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
        <Field label="Ulangi kata sandi baru" id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
        {password?.error ? <p className="text-sm text-danger" role="alert">{password.error}</p> : password?.data ? <p className="text-sm text-success" role="status">Kata sandi berhasil diperbarui.</p> : null}<div className="flex justify-end"><Button type="submit" disabled={passwordPending}>{passwordPending ? "Menyimpan…" : "Simpan kata sandi"}</Button></div>
      </form>
    </Panel>
    <Panel title="Ubah Nama Petugas" className="p-5 sm:p-6">
      <form action={profileAction} className="flex flex-col gap-4">
        <Field label="Nama petugas" id="staff-name" defaultValue={user?.name || ""} name="name" type="text" autoComplete="name" minLength={2} maxLength={160} required />
        <SubmitResult state={profile}/><div className="flex justify-end"><Button type="submit" disabled={profilePending}>{profilePending ? "Menyimpan…" : "Simpan nama"}</Button></div>
      </form>
    </Panel>
    <Panel title="Sesi akun" className="p-5 sm:p-6 xl:col-span-2"><p className="mb-4 text-sm text-muted">Keluar dari sesi lain yang mungkin masih aktif di perangkat berbeda.</p><form action={sessionsAction} className="flex flex-col items-start gap-3"><SubmitResult state={sessions}/><Button type="submit" variant="ghost" disabled={sessionsPending}>{sessionsPending ? "Mengakhiri sesi…" : "Keluar dari sesi lain"}</Button></form></Panel>
  </div>;
}
