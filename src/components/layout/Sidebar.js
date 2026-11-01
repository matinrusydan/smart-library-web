const groups = [
  { title: "Dashboard", items: ["Ringkasan"] },
  { title: "Data Buku", items: ["Daftar Buku", "Master Kategori"] },
  { title: "Data Siswa", items: ["Siswa"] },
  { title: "Sirkulasi", items: ["Peminjaman", "Pengembalian"] },
  { title: "Keuangan", items: ["Denda & Pembayaran"] },
  { title: "Monitoring", items: ["Stok Buku"] },
  { title: "Laporan", items: ["Peminjaman", "Pengembalian"] },
  { title: "Pengaturan", items: ["Preferensi"] },
];

export function Sidebar() {
  return (
    <aside className="hidden flex-col gap-5 border-r border-white/10 bg-sidebar px-4 py-5 text-white min-[861px]:flex">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-primary font-bold text-on-primary" aria-hidden="true">SL</span><span><span className="block font-bold">Smart Library</span><span className="block text-xs text-white/70">Portal Petugas</span></span></div>
      <nav aria-label="Navigasi utama" className="space-y-4">
        {groups.map((group) => <section key={group.title}><h2 className="mb-1 text-xs uppercase tracking-widest text-white/70">{group.title}</h2><ul className="space-y-1">{group.items.map((item, index) => <li key={`${group.title}-${item}`}><a aria-current={group.title === "Dashboard" ? "page" : undefined} className={`block rounded-md px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white ${group.title === "Dashboard" ? "bg-white/15 font-semibold text-white" : ""}`} href="#showcase">{item}</a></li>)}</ul></section>)}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-4 text-xs text-white/70">Design system · Phase 0</div>
    </aside>
  );
}
