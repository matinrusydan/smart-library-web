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
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark" aria-hidden="true">SL</span><span><span className="brand-title">Smart Library</span><span className="brand-subtitle">Portal Petugas</span></span></div>
      <nav aria-label="Navigasi utama">
        {groups.map((group) => <section className="nav-group" key={group.title}><h2 className="nav-group-title">{group.title}</h2><ul className="nav-list">{group.items.map((item, index) => <li key={`${group.title}-${item}`}><a className={`nav-item ${group.title === "Dashboard" ? "active" : ""}`} href="#showcase">{item}</a></li>)}</ul></section>)}
      </nav>
      <div className="sidebar-footer">Design system · Phase 0</div>
    </aside>
  );
}
