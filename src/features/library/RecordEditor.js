"use client";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { saveBookAction, saveCategoryAction, saveStudentAction } from "@/app/actions/library";

const actions = { books: saveBookAction, categories: saveCategoryAction, students: saveStudentAction };
function SubmitButton({ editing }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-on-primary disabled:opacity-60">{pending ? "Menyimpan…" : editing ? "Simpan perubahan" : "Simpan"}</button>;
}

function Input({ name, label, record, type = "text", required = true }) {
  return <label className="block text-sm font-medium" htmlFor={`record-${name}`}>{label}<input id={`record-${name}`} name={name} type={type} required={required} defaultValue={record?.[name] ?? ""} className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-normal" /></label>;
}

function RecordForm({ kind, record, categories, onClose, onSaved }) {
  const [state, action] = useActionState(actions[kind], null);
  useEffect(() => { if (state?.success) onSaved(); }, [state, onSaved]);
  const editing = Boolean(record);
  return <form action={action} className="space-y-4">
    {record?.id && <input type="hidden" name="id" value={record.id} />}
    {kind === "books" && record?.id && <input type="hidden" name="expectedStockTotal" value={record.stockTotal} />}
    <div className="grid max-h-[60vh] gap-4 overflow-y-auto px-1 sm:grid-cols-2">
      {kind === "books" && <>
        <div className="sm:col-span-2"><Input name="title" label="Judul buku" record={record} /></div>
        <Input name="isbn" label="ISBN" record={record} required={false} /><Input name="author" label="Penulis" record={record} />
        <Input name="publisher" label="Penerbit" record={record} required={false} /><Input name="publicationYear" label="Tahun terbit" record={record} type="number" required={false} />
        <label className="block text-sm font-medium" htmlFor="record-categoryId">Kategori<select id="record-categoryId" name="categoryId" required defaultValue={record?.categoryId ?? ""} className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-normal"><option value="">Pilih kategori</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <Input name="stockTotal" label="Jumlah stok" record={record} type="number" />
        <p className="self-end text-sm text-muted">Stok tersedia dihitung otomatis dari jumlah stok dan peminjaman aktif.</p>
      </>}
      {kind === "categories" && <>
        <Input name="name" label="Kategori" record={record} />
        <label className="block text-sm font-medium" htmlFor="record-isActive">Status<select id="record-isActive" name="isActive" defaultValue={record?.isActive === false ? "false" : "true"} className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-normal"><option value="true">Aktif</option><option value="false">Tidak Aktif</option></select></label>
        <label className="block text-sm font-medium sm:col-span-2" htmlFor="record-description">Deskripsi (opsional)<textarea id="record-description" name="description" rows="3" defaultValue={record?.description ?? ""} className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-normal" /></label>
      </>}
      {kind === "students" && <>
        <Input name="studentNumber" label="NIS" record={record} /><Input name="name" label="Nama" record={record} />
        <Input name="className" label="Kelas" record={record} required={false} /><Input name="email" label="Email" record={record} type="email" required={false} />
        <Input name="phone" label="Telepon (opsional)" record={record} type="tel" required={false} />
      </>}
    </div>
    {state?.error && <p role="alert" className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{state.error}</p>}
    <footer className="flex justify-end gap-3 border-t border-border pt-4"><button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2.5">Batal</button><SubmitButton editing={editing} /></footer>
  </form>;
}

export function RecordEditor({ kind, record, categories, onClose, onSaved }) {
  const label = kind === "books" ? "buku" : kind === "categories" ? "kategori" : "siswa";
  return <Modal open onClose={onClose} title={`${record ? "Edit" : "Tambah"} ${label}`}><RecordForm key={`${kind}-${record?.id ?? "new"}`} kind={kind} record={record} categories={categories} onClose={onClose} onSaved={onSaved} /></Modal>;
}
