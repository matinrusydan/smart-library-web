import { SettingsForms } from "@/features/settings/SettingsForms";
import { getCurrentUser } from "@/server/auth";
import { connection } from "next/server";

export default async function SettingsPage() {
  await connection();
  const user = await getCurrentUser();
  return <main className="flex w-full flex-col gap-4">
    <section><h2 className="font-display text-xl font-bold text-text sm:text-2xl">Pengaturan akun</h2><p className="mt-1 text-sm text-muted">Perbarui informasi profil dan kata sandi akun Anda.</p></section>
    <SettingsForms user={user} />
  </main>;
}
