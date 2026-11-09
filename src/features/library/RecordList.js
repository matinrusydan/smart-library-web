"use client";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

const titles = { books: "Daftar Buku", categories: "Master Kategori", students: "Data Siswa" };
const kindLabel = { books: "buku", categories: "kategori", students: "siswa" };

export function RecordList({
  kind,
  data,
  page,
  pageSize,
  search,
  active = "all",
  className = "all",
  setClassName = () => {},
  categories = [],
  categoryId = "",
  setCategoryId = () => {},
  setPage,
  setPageSize,
  setSearch,
  setActive,
  onCreate,
  onEdit,
  onImport,
  onRefreshed = () => {},
  onDeletedStudents = () => {},
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const items = data?.items || [];
  const allPageSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  function toggleAllPage(checked) {
    if (checked) {
      const merged = new Set([...selectedIds, ...items.map((i) => i.id)]);
      setSelectedIds(Array.from(merged));
    } else {
      const pageIdSet = new Set(items.map((i) => i.id));
      setSelectedIds(selectedIds.filter((id) => !pageIdSet.has(id)));
    }
  }

  function toggleOne(id, checked) {
    if (checked) setSelectedIds((prev) => [...prev, id]);
    else setSelectedIds((prev) => prev.filter((item) => item !== id));
  }

  const categoryNames = new Map(categories.map((item) => [String(item.id), item.name]));

  const renderActions = (row) => (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onEdit(row)}
        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-primary transition hover:bg-soft"
      >
        <span aria-hidden="true">✎</span>Edit
      </button>
      <button
        type="button"
        onClick={() => setDeleteTarget({ kind, ids: [row.id] })}
        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-danger shadow-sm transition hover:bg-soft"
      >
        <span aria-hidden="true">🗑</span>Hapus
      </button>
    </div>
  );

  const selectColumn = {
    key: "select",
    label: (
      <input
        type="checkbox"
        aria-label={`Pilih semua ${kindLabel[kind]} di halaman ini`}
        checked={allPageSelected}
        onChange={(event) => toggleAllPage(event.target.checked)}
      />
    ),
    render: (row) => (
      <input
        type="checkbox"
        aria-label={`Pilih ${row.title || row.name || `ID ${row.id}`}`}
        checked={selectedIds.includes(row.id)}
        onChange={(event) => toggleOne(row.id, event.target.checked)}
      />
    ),
  };

  let columns;
  if (kind === "books") {
    columns = [
      selectColumn,
      { key: "code", label: "Kode", render: (row) => row.isbn || <span className="text-muted">ID {row.id}</span> },
      { key: "title", label: "Judul" },
      { key: "publisher", label: "Penerbit" },
      { key: "publicationYear", label: "Tahun" },
      {
        key: "category",
        label: "Kategori",
        render: (row) => (
          <span className="rounded-full bg-soft px-2 py-0.5 text-xs text-primary">
            {row.categoryName || categoryNames.get(String(row.categoryId)) || "—"}
          </span>
        ),
      },
      { key: "stock", label: "Stok", render: (row) => `${row.stockAvailable ?? 0} / ${row.stockTotal ?? 0}` },
      { key: "actions", label: "Aksi", render: renderActions },
    ];
  } else if (kind === "categories") {
    columns = [
      selectColumn,
      { key: "name", label: "Kategori" },
      { key: "description", label: "Deskripsi", render: (row) => row.description || <span className="text-muted">—</span> },
      {
        key: "isActive",
        label: "Status",
        render: (row) => (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              row.isActive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}
          >
            {row.isActive ? "Aktif" : "Tidak Aktif"}
          </span>
        ),
      },
      { key: "actions", label: "Aksi", render: renderActions },
    ];
  } else {
    columns = [
      selectColumn,
      { key: "studentNumber", label: "NIS" },
      { key: "name", label: "Nama" },
      {
        key: "className",
        label: "Kelas",
        render: (row) => (row.className ? <span className="rounded-full bg-soft px-2 py-0.5 text-xs text-primary">{row.className}</span> : "—"),
      },
      { key: "email", label: "Email" },
      {
        key: "isActive",
        label: "Status",
        render: (row) => (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              row.isActive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}
          >
            {row.isActive ? "Aktif" : "Tidak Aktif"}
          </span>
        ),
      },
      { key: "actions", label: "Aksi", render: renderActions },
    ];
  }

  return (
    <main className="flex w-full flex-col">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{titles[kind]}</h1>
          <p className="mt-0.5 text-sm text-muted">
            {kind === "books"
              ? "Kelola koleksi dan stok buku perpustakaan"
              : kind === "categories"
                ? "Kelola kategori buku tanpa mengubah sistem"
                : "Kelola data siswa anggota perpustakaan"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedIds.length > 0 && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setDeleteTarget({ kind, ids: selectedIds })}
              className="rounded-lg"
            >
              Hapus {selectedIds.length} {kindLabel[kind]}
            </Button>
          )}
          {kind === "students" && (
            <Button type="button" variant="surface" onClick={onImport} size="sm" className="rounded-lg">
              Import siswa
            </Button>
          )}
          <Button type="button" onClick={onCreate} size="sm" className="rounded-lg">
            ＋ &nbsp;Tambah {kindLabel[kind]}
          </Button>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-[240px] flex-1">
          <span className="sr-only">
            Cari {kind === "books" ? "kode atau judul buku" : kind === "categories" ? "kategori" : "NIS atau nama siswa"}
          </span>
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={
              kind === "books"
                ? "Cari kode atau judul buku…"
                : kind === "categories"
                  ? "Cari kategori…"
                  : "Cari NIS atau nama siswa…"
            }
            className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
        </label>
        {kind === "books" && (
          <label>
            <span className="sr-only">Kategori</span>
            <select
              aria-label="Kategori"
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setPage(1);
              }}
              className="block min-w-40 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
            >
              <option value="">Semua kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {kind === "categories" && (
          <label>
            <span className="sr-only">Status</span>
            <select
              aria-label="Status"
              value={active}
              onChange={(event) => {
                setActive(event.target.value);
                setPage(1);
              }}
              className="block min-w-36 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
            >
              <option value="all">Semua status</option>
              <option value="true">Aktif</option>
              <option value="false">Tidak Aktif</option>
            </select>
          </label>
        )}
        {kind === "students" && (
          <>
            <label>
              <span className="sr-only">Kelas</span>
              <input
                aria-label="Kelas"
                value={className === "all" ? "" : className}
                onChange={(event) => {
                  setClassName(event.target.value || "all");
                  setPage(1);
                }}
                placeholder="Semua kelas"
                className="block w-40 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
              />
            </label>
            <label>
              <span className="sr-only">Status</span>
              <select
                aria-label="Status"
                value={active}
                onChange={(event) => {
                  setActive(event.target.value);
                  setPage(1);
                }}
                className="block min-w-36 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
              >
                <option value="all">Semua status</option>
                <option value="true">Aktif</option>
                <option value="false">Tidak Aktif</option>
              </select>
            </label>
          </>
        )}
      </div>

      <Panel title={titles[kind]} className="mt-3 p-3 sm:p-3.5">
        <DataTable columns={columns} rows={items} getRowKey={(row) => row.id} />
        {!items.length && <p className="py-6 text-center text-sm text-muted">Tidak ada data yang cocok.</p>}
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data?.total || 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Panel>

      {deleteTarget && (
        <DeleteConfirmModal
          kind={deleteTarget.kind || kind}
          selectedIds={deleteTarget.ids}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            const deletedSet = new Set(deleteTarget.ids);
            setSelectedIds((prev) => prev.filter((id) => !deletedSet.has(id)));
            setDeleteTarget(null);
            onRefreshed();
            onDeletedStudents();
          }}
        />
      )}
    </main>
  );
}
