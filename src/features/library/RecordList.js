import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";

const titles = { books: "Daftar Buku", categories: "Master Kategori", students: "Data Siswa" };
const kindLabel = { books: "buku", categories: "kategori", students: "siswa" };

export function RecordList({ kind, data, page, pageSize, search, active = "all", className = "all", setClassName = () => {}, categories = [], categoryId = "", setCategoryId = () => {}, setPage, setPageSize, setSearch, setActive, onCreate, onEdit }) {
  const categoryNames = new Map(categories.map((item) => [String(item.id), item.name]));
  const editButton = (row) => <button type="button" onClick={() => onEdit(row)} className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-primary transition hover:bg-soft"><span aria-hidden="true">✎</span>Edit</button>;
  let columns;
  if (kind === "books") columns = [
    { key: "code", label: "Kode", render: (row) => row.isbn || <span className="text-muted">ID {row.id}</span> },
    { key: "title", label: "Judul" }, { key: "publisher", label: "Penerbit" },
    { key: "publicationYear", label: "Tahun" },
    { key: "category", label: "Kategori", render: (row) => <span className="rounded-full bg-soft px-2 py-0.5 text-xs text-primary">{row.categoryName || categoryNames.get(String(row.categoryId)) || "—"}</span> },
    { key: "stock", label: "Stok", render: (row) => `${row.stockAvailable ?? 0} / ${row.stockTotal ?? 0}` },
    { key: "actions", label: "Aksi", render: editButton },
  ];
  else if (kind === "categories") columns = [
    { key: "name", label: "Kategori" },
    { key: "isActive", label: "Status", render: (row) => <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.isActive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{row.isActive ? "Aktif" : "Tidak Aktif"}</span> },
    { key: "actions", label: "Aksi", render: editButton },
  ];
  else columns = [
    { key: "studentNumber", label: "NIS" }, { key: "name", label: "Nama" },
    { key: "className", label: "Kelas", render: (row) => row.className ? <span className="rounded-full bg-soft px-2 py-0.5 text-xs text-primary">{row.className}</span> : "—" },
    { key: "email", label: "Email" }, { key: "actions", label: "Aksi", render: editButton },
  ];

  return <main className="flex w-full flex-col">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-display text-2xl font-bold">{titles[kind]}</h1><p className="mt-0.5 text-sm text-muted">{kind === "books" ? "Kelola koleksi dan stok buku perpustakaan" : kind === "categories" ? "Kelola kategori buku tanpa mengubah sistem" : "Kelola data siswa anggota perpustakaan"}</p></div><Button type="button" onClick={onCreate} size="sm" className="rounded-lg">＋ &nbsp;Tambah {kindLabel[kind]}</Button></header>
    <div className="mt-4 flex flex-wrap items-end gap-3">
      <label className="min-w-[240px] flex-1"><span className="sr-only">Cari {kind === "books" ? "kode atau judul buku" : kind === "categories" ? "kategori" : "NIS atau nama siswa"}</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={kind === "books" ? "Cari kode atau judul buku…" : kind === "categories" ? "Cari kategori…" : "Cari NIS atau nama siswa…"} className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary" /></label>
      {kind === "books" && <label><span className="sr-only">Kategori</span><select aria-label="Kategori" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }} className="block min-w-40 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"><option value="">Semua kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>}
      {kind === "categories" && <label><span className="sr-only">Status</span><select aria-label="Status" value={active} onChange={(event) => { setActive(event.target.value); setPage(1); }} className="block min-w-36 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"><option value="all">Semua status</option><option value="true">Aktif</option><option value="false">Tidak Aktif</option></select></label>}
      {kind === "students" && <label><span className="sr-only">Kelas</span><input aria-label="Kelas" value={className === "all" ? "" : className} onChange={(event) => { setClassName(event.target.value || "all"); setPage(1); }} placeholder="Semua kelas" className="block w-40 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text" /></label>}
    </div>
    <Panel title={titles[kind]} className="mt-3 p-3 sm:p-3.5"><DataTable columns={columns} rows={data.items || []} getRowKey={(row) => row.id} />{!data.items?.length && <p className="py-6 text-center text-sm text-muted">Tidak ada data yang cocok.</p>}<Pagination page={page} pageSize={pageSize} total={data.total || 0} onPageChange={setPage} onPageSizeChange={setPageSize} /></Panel>
  </main>;
}
