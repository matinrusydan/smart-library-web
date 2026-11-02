"use client";
import { useSyncExternalStore } from "react";
import { Button } from "../ui/Button";
import { logoutAction } from "@/app/actions/auth";
import { Modal } from "@/components/ui/Modal";
import { useEffect, useState } from "react";
import { DashboardSearch } from "@/features/dashboard/DashboardSearch";

function subscribe(callback) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function getSnapshot() {
  return document.documentElement.dataset.theme || "light";
}
function getServerSnapshot() {
  return "light";
}

export function Topbar({ user, title = "Smart Library" }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [confirmLogout,setConfirmLogout]=useState(false);
  const descriptions = { Ringkasan: "Ringkasan aktivitas perpustakaan", "Daftar Buku": "Kelola koleksi buku perpustakaan", "Master Kategori": "Kelola kategori buku", "Data Siswa": "Kelola data anggota perpustakaan" };

  useEffect(() => {
    const requestLogout = () => setConfirmLogout(true);
    window.addEventListener("smart-library:request-logout", requestLogout);
    return () => window.removeEventListener("smart-library:request-logout", requestLogout);
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("smart-library-theme", next);
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <header className="min-h-[72px] border-b border-border bg-surface">
      <div className="flex min-h-[72px] w-full items-center justify-between gap-3 py-3 sm:py-3.5">
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="border-l-2 border-primary pl-3"><h1 className="font-display text-lg font-bold leading-tight text-text sm:text-xl">{title === "Ringkasan" ? "Dashboard Petugas" : title}</h1><p className="text-xs text-muted">{descriptions[title] || "Pengelolaan perpustakaan"}</p></div></div>{title === "Ringkasan" && <div className="hidden md:block"><DashboardSearch compact /></div>}</div>
      <div className="flex shrink-0 items-center gap-2">
        {user && <span className="hidden text-sm text-muted xl:inline">{user.name}</span>}
        <Button variant="ghost" onClick={toggleTheme} aria-label={theme === "light" ? "Aktifkan tema gelap" : "Aktifkan tema terang"} title={theme === "light" ? "Tema gelap" : "Tema terang"}><svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7">{theme === "light" ? <><path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.6 8.6 0 1 0 20.5 15.2Z"/></> : <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>}</svg></Button>
        {user && <button type="button" onClick={()=>setConfirmLogout(true)} aria-label="Keluar" title="Keluar" className="grid size-[40px] shrink-0 place-items-center rounded-md text-muted transition hover:bg-soft hover:text-text"><svg aria-hidden="true" viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M10 17l5-5-5-5m5 5H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg></button>}
      </div>
      </div>
      <Modal open={confirmLogout} onClose={()=>setConfirmLogout(false)} title="Keluar dari akun?"><p className="text-muted">Anda perlu masuk kembali untuk menggunakan portal.</p><div className="flex justify-end gap-3"><Button variant="ghost" onClick={()=>setConfirmLogout(false)}>Batal</Button><form action={logoutAction}><Button type="submit" variant="danger">Keluar</Button></form></div></Modal>
    </header>
  );
}
