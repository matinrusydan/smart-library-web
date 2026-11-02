import { getDashboardSummary } from "@/server/queries";
import { Panel } from "@/components/ui/Panel";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";

const number = (value) => Number(value || 0).toLocaleString("id-ID");
const date = (value) => value ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "—";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const stats = [
    ["Jumlah judul buku", summary.bookTitles, "judul"],
    ["Siswa aktif", summary.activeStudents, "siswa"],
    ["Sedang dipinjam", summary.activeBorrowings, "peminjaman"],
    ["Terlambat", summary.overdueBorrowings, "perlu ditindaklanjuti"],
    ["Stok menipis", summary.lowStockBooks, "judul tersisa 1–2"],
    ["Dikembalikan", summary.returnedBorrowings, "selesai"],
  ];
  const columns = [
    { key: "studentName", label: "Siswa" }, { key: "bookTitle", label: "Buku" },
    { key: "borrowedAt", label: "Tgl pinjam", render: (row) => date(row.borrowedAt) },
    { key: "status", label: "Status", render: (row) => <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.status === "overdue" ? "bg-danger/10 text-danger" : row.status === "returned" ? "bg-success/10 text-success" : "bg-soft text-primary"}`}>{row.status === "overdue" ? "Terlambat" : row.status === "returned" ? "Dikembalikan" : "Dipinjam"}</span> },
  ];
    return <main className="flex w-full flex-col gap-4">
      <section className="flex min-h-[111px] flex-wrap items-center justify-between gap-4 rounded-[14px] bg-primary px-6 py-5 text-on-primary shadow-sm"><div><Badge tone="hero" ><span className="mr-2 size-[7px] rounded-full bg-accent" aria-hidden="true"/>Dashboard Petugas</Badge><h2 className="mt-2 font-display text-xl font-bold sm:text-2xl">Selamat datang di Digital Library</h2><p className="mt-1 text-sm text-on-primary/75">Kelola buku, siswa, peminjaman, dan stok dari satu panel.</p></div><LinkButton href="/buku" size="sm" className="w-[141px] rounded-lg bg-surface text-primary shadow-sm hover:bg-bg">Kelola Buku <span className="ml-1" aria-hidden="true">→</span></LinkButton></section>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Ringkasan statistik">{stats.map(([label, value, caption], index) => <Panel key={label} className="relative min-h-[155px] p-5 transition-shadow hover:shadow-md"><div className="mb-3 flex items-start justify-between"><span className={`grid size-10 place-items-center rounded-[10px] ${index === 3 ? "bg-danger/10 text-danger" : index === 4 ? "bg-accent/20 text-warning" : "bg-soft text-primary"}`} aria-hidden="true"><StatIcon index={index}/></span><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${index === 3 ? "bg-danger/10 text-danger" : index === 4 ? "bg-warning/10 text-warning" : "bg-soft text-primary"}`}>{index === 3 ? "Perhatian" : index === 4 ? "Stok" : "Ringkasan"}</span></div><p className="text-sm font-medium text-muted">{label}</p><p className="mt-1 font-display text-3xl font-bold tracking-tight">{number(value)}</p><p className="mt-1 text-xs text-muted">{caption}</p></Panel>)}</section>
     <Panel title="Peminjaman terbaru" className="min-h-[300px] p-5"><DataTable columns={columns} rows={summary.recentBorrowings || []} getRowKey={(row) => row.id} />{!summary.recentBorrowings?.length && <p className="py-12 text-center text-sm text-muted">Belum ada peminjaman.</p>}</Panel>
  </main>;
}

function StatIcon({ index }) {
  const paths = [<><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5z"/><path d="M5 4.5v17M9 6h7"/></>, <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1zm12-15a3 3 0 0 1 0 6m3 3a5 5 0 0 1 3 5v1h-3"/></>, <><path d="M4 6h16v15H4zM8 3v6m8-6v6M4 11h16"/></>, <><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></>, <><path d="M4 5h16v15H4zM8 9h8m-8 4h5"/><path d="m7 2 5 3 5-3"/></>, <><path d="m5 12 4 4L19 6"/><circle cx="12" cy="12" r="9"/></>];
  return <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[index]}</svg>;
}
