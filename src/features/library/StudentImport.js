"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Panel } from "@/components/ui/Panel";

const STORAGE_KEY = "smart-library-student-import-job";
const terminal = (job) => ["COMPLETED", "FAILED", "CANCELLED"].includes(String(job?.status || "").toUpperCase());
const inProgress = (job) => ["PENDING", "PROCESSING"].includes(String(job?.status || "").toUpperCase());

async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || body.error || "Permintaan gagal. Silakan coba lagi.");
  }
  return response.json();
}

export function StudentImport({ open, onClose, onComplete }) {
  const [file, setFile] = useState(null);
  const [job, setJob] = useState(null);
  const [preview, setPreview] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const active = useRef(true);
  const refresh = useRef(onComplete);
  useEffect(() => { refresh.current = onComplete; }, [onComplete]);

  const saveJob = useCallback((next) => {
    if (!next) return;
    setJob(next);
    if (typeof window !== "undefined" && next.id) window.localStorage.setItem(STORAGE_KEY, String(next.id));
  }, []);

  useEffect(() => {
    active.current = true;
    const id = window.localStorage.getItem(STORAGE_KEY);
    if (id) request(`/api/students/import/${encodeURIComponent(id)}`).then(({ job: found }) => {
      if (!active.current || !found) return;
      saveJob(found);
      if (terminal(found)) { window.localStorage.removeItem(STORAGE_KEY); if (String(found.status).toUpperCase() === "COMPLETED") refresh.current?.(); }
    }).catch((failure) => { if (active.current) setError(failure.message); });
    return () => { active.current = false; };
  }, [saveJob]);

  const pollJob = useCallback(async (id, initial) => {
    let current = initial;
    while (active.current && current && inProgress(current)) {
      const result = await request(`/api/students/import/${encodeURIComponent(id)}/process`, { method: "POST" });
      current = result.job;
      if (current) saveJob(current);
    }
    if (!active.current) return;
    if (!current || terminal(current)) {
      window.localStorage.removeItem(STORAGE_KEY);
      if (String(current?.status || "").toUpperCase() === "COMPLETED") refresh.current?.();
    }
  }, [saveJob]);

  const start = async (id) => {
    const result = await request(`/api/students/import/${encodeURIComponent(id)}/start`, { method: "POST" });
    const started = result.job;
    if (started) saveJob(started);
    await pollJob(id, started);
  };

  const prepare = async (selected) => {
    if (!selected) return;
    setFile(selected); setError(""); setBusy(true); setJob(null);
    try {
      const form = new FormData(); form.append("file", selected);
      const result = await request("/api/students/import/preview", { method: "POST", body: form });
      setPreview(Array.isArray(result.preview) ? result.preview : []);
      setValidationErrors(Array.isArray(result.validationErrors) ? result.validationErrors : []);
      if (result.job) saveJob(result.job);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };

  const confirm = async () => {
    if (!job?.id) return;
    setBusy(true); setError("");
    try { await start(job.id); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };

  const resume = async () => {
    if (!job?.id) return;
    setBusy(true); setError("");
    try {
      const result = await request(`/api/students/import/${encodeURIComponent(job.id)}`);
      if (result.job) saveJob(result.job);
      if (inProgress(result.job)) await pollJob(job.id, result.job);
      else if (String(result.job?.status || "").toUpperCase() === "FAILED") {
        const retried = await request(`/api/students/import/${encodeURIComponent(job.id)}/retry`, { method: "POST" });
        if (retried.job) { saveJob(retried.job); await pollJob(job.id, retried.job); }
      }
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };

  const columns = [
    { key: "studentNumber", label: "NIS" },
    { key: "name", label: "Nama" },
    { key: "className", label: "Kelas" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Telepon" },
  ];
  const status = String(job?.status || "").toUpperCase();

  return <Modal open={open} onClose={onClose} title="Import siswa">
    <div className="space-y-4">
      <p className="text-sm text-muted">Unggah lembar kerja Excel untuk menambahkan banyak siswa sekaligus.</p>
      <LinkButton href="/api/students/import/template" variant="surface" size="sm" className="w-fit">Unduh template Excel</LinkButton>
      <Field id="student-import-file" label="File Excel" hint="Format .xlsx saja.">
        <input id="student-import-file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => prepare(event.target.files?.[0])} className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" aria-describedby="student-import-status" />
      </Field>
      {file && <p className="text-sm text-muted">File dipilih: {file.name}</p>}
      {error && <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm text-danger">{error}</p>}
      {job && <section id="student-import-status" aria-live="polite" aria-atomic="true" className="space-y-2">
        <div className="flex items-center justify-between gap-2"><strong className="text-sm">{status === "COMPLETED" ? "Import selesai" : status === "FAILED" ? "Import terhenti" : "Import berjalan"}</strong><Badge>{job.processed || 0} / {job.total || 0} siswa</Badge></div>
        <progress className="w-full accent-primary" max={job.total || 1} value={job.processed || 0} aria-label="Kemajuan import siswa" />
        <p className="text-sm text-muted">{job.inserted || 0} ditambahkan · {job.skipped || 0} dilewati</p>
        {status === "DRAFT" && preview.length === 0 && <p className="text-sm text-muted">Pratinjau sebelumnya tidak tersimpan di browser. Pilih kembali file untuk memeriksa data sebelum konfirmasi.</p>}
      </section>}
      {validationErrors.length > 0 && <Panel title="Perlu diperbaiki" className="max-h-48 overflow-auto"><ul className="list-inside list-disc space-y-1 text-sm text-danger">{validationErrors.map((item, index) => <li key={index}>{typeof item === "string" ? item : item.message || JSON.stringify(item)}</li>)}</ul></Panel>}
      {preview.length > 0 && <Panel title={`Pratinjau (${preview.length} baris)`} className="max-h-64 overflow-auto"><DataTable columns={columns} rows={preview} getRowKey={(row, index) => row.id ?? row.studentNumber ?? index} /></Panel>}
      <footer className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onClose}>Tutup</Button>
        {status === "FAILED" && <Button variant="surface" type="button" disabled={busy} onClick={resume}>Lanjutkan import</Button>}
        {job && !terminal(job) && !inProgress(job) && <Button type="button" disabled={busy || validationErrors.length > 0 || (status === "DRAFT" && preview.length === 0)} onClick={confirm}>{busy ? "Memproses…" : "Konfirmasi import"}</Button>}
        {job && inProgress(job) && <Button type="button" disabled={busy} onClick={resume}>{busy ? "Memproses…" : "Lanjutkan import"}</Button>}
        {busy && !job && <span role="status" className="self-center text-sm text-muted">Memeriksa file…</span>}
      </footer>
    </div>
  </Modal>;
}
