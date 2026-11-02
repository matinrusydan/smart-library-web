"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  { title: "Dashboard", items: [["Dashboard", "/", "dashboard"]] },
  { title: "Data Buku", items: [["Daftar Buku", "/buku", "book"], ["Master Kategori", "/kategori", "category"]] },
  { title: "Data Siswa", items: [["Data Siswa", "/siswa", "people"]] },
  { title: "Peminjaman", items: [["Peminjaman", "/peminjaman", "calendar"]] },
  { title: "Pengembalian", items: [["Pengembalian", "/pengembalian", "return"]] },
  { title: "Keuangan", items: [["Denda & Pembayaran", "/denda", "wallet"]] },
  { title: "Monitoring", items: [["Monitoring Stok", "/monitoring-stok", "inventory"]] },
  { title: "Laporan", items: [["Laporan Peminjaman", "/laporan-peminjaman", "report"], ["Laporan Pengembalian", "/laporan-pengembalian", "report"]] },
  { title: "Pengaturan", items: [["Pengaturan", null, "settings"]] },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <>
      <div className="flex items-center justify-between border-b border-white/10 bg-sidebar px-[20px] py-3 text-white min-[861px]:hidden">
      <Link href="/" className="flex items-center gap-3"><Brand/><span><b className="block text-sm">Digital Library</b><small className="text-white/60">Panel Petugas</small></span></Link>
      <button type="button" aria-expanded={open} aria-controls="mobile-primary-nav" onClick={() => setOpen(v => !v)} className="min-h-[40px] rounded-lg border border-white/20 px-[12px] py-[8px] text-sm">{open ? "Tutup" : "Menu"}</button>
    </div>
    <aside className="hidden h-dvh min-h-0 flex-col overflow-hidden bg-sidebar text-white min-[861px]:sticky min-[861px]:top-0 min-[861px]:flex min-[861px]:h-screen">
      <Link href="/" className="flex min-h-[74px] items-center gap-3 border-b border-white/10 px-[20px]"><Brand/><span><span className="block font-display text-[15px] font-bold">Digital Library</span><span className="block text-xs text-white/60">Panel Petugas</span></span></Link>
      <Navigation pathname={pathname}/>
      <div className="mt-auto border-t border-white/10 p-[16px]"><button type="button" onClick={() => window.dispatchEvent(new Event("smart-library:request-logout"))} className="flex min-h-[40px] w-full items-center gap-3 rounded-lg px-[12px] py-[10px] text-sm text-white/70 transition hover:bg-red-900/30 hover:text-white"><Icon name="logout"/>Keluar Akun</button></div>
    </aside>
    {open && <nav id="mobile-primary-nav" aria-label="Navigasi utama" className="flex flex-wrap gap-2 border-b border-white/10 bg-sidebar p-3 text-white min-[861px]:hidden">{groups.flatMap(group => group.items.map(([item, href], index) => href ? <Link key={href} onClick={() => setOpen(false)} href={href} className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">{item}</Link> : <span key={`${group.title}-${item}-${index}`} aria-disabled="true" title="Belum tersedia" className="rounded-lg px-3 py-2 text-sm text-white/45">{item} · Segera</span>))}</nav>}
  </>;
}

// Approximation of the Figma auto_stories mark; the original icon asset is not available in this source tree.
function Brand() { return <span className="grid size-[40px] shrink-0 place-items-center rounded-[10px] bg-accent text-primary"><Icon name="auto_stories"/></span>; }

function Navigation({ pathname }) {
  return <nav aria-label="Navigasi utama" className="min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto overscroll-contain px-0 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{groups.map(group => <section key={group.title || "dashboard"}>{group.title && <h2 className="mb-1 px-4 text-[10px] font-bold uppercase tracking-[.14em] text-white/40">{group.title}</h2>}<ul className="space-y-1">{group.items.map(([item, href, icon]) => <li key={item}>{href ? <Link aria-current={pathname === href ? "page" : undefined} href={href} className={`flex items-center gap-3 px-4 py-2.5 text-[13px] transition ${pathname === href ? "bg-white/[.12] font-semibold text-white" : "text-white/65 hover:bg-white/[.07] hover:text-white"}`}><Icon name={icon}/>{item}</Link> : <span aria-disabled="true" title="Belum tersedia" className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-white/35"><Icon name={icon}/>{item}</span>}</li>)}</ul></section>)}</nav>;
}

function Icon({ name }) {
  const shapes = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    book: <><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5z"/><path d="M5 4.5v17M9 6h7"/></>,
    auto_stories: <><path d="M12 7v14"/><path d="M3 18V5a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4 4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v13h-5a4 4 0 0 0-4 3 4 4 0 0 0-4-3z"/><path d="M7 7h2m6 0h2"/></>,
    category: <><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1zm12-15a3 3 0 0 1 0 6m3 3a5 5 0 0 1 3 5v1h-3"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></>,
    return: <><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-2"/></>,
    wallet: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M16 15h2"/></>,
    inventory: <><path d="m3 7 9-4 9 4v11l-9 4-9-4z"/><path d="m3 7 9 4 9-4m-9 4v11"/></>,
    report: <><path d="M5 3h10l4 4v14H5z"/><path d="M14 3v5h5M8 13h8m-8 4h8"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.2.9-1.2 2.1-1.4-.6a8 8 0 0 1-1.6.9l-.2 1.6h-2.5l-.3-1.6a8 8 0 0 1-1.6-.9l-1.4.6-1.2-2.1 1.3-.9a7 7 0 0 1 0-1.9l-1.3-.9 1.2-2.1 1.4.6a8 8 0 0 1 1.6-.9l.3-1.6h2.5l.2 1.6a8 8 0 0 1 1.6.9l1.4-.6 1.2 2.1-1.2.9a7 7 0 0 1 0 1.9z"/></>,
    logout: <><path d="M10 17l5-5-5-5m5 5H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{shapes[name]}</svg>;
}
