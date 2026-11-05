"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

  const handleClose = useCallback(() => {
    const statusUpper = String(job?.status || "").toUpperCase();
    if (busy && inProgress(job)) return;
    setFile(null);
    setJob(null);
    setPreview([]);
    setValidationErrors([]);
    setError("");
    if (statusUpper === "COMPLETED") refresh.current?.();
    onClose();
  }, [busy, job, onClose]);

  useEffect(() => {
    active.current = true;
    const id = window.localStorage.getItem(STORAGE_KEY);
    if (id) request(`/api/students/import/${encodeURIComponent(id)}`).then(({ job: found }) => {
      if (!active.current || !found) return;
      saveJob(found);
      if (terminal(found)) {
        window.localStorage.removeItem(STORAGE_KEY);
        if (String(found.status).toUpperCase() === "COMPLETED") refresh.current?.();
      }
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
  const isProcessing = (busy && status !== "DRAFT") || inProgress(job);

  return (
    <Modal open={open} onClose={handleClose} title="Import siswa">
      <div className="space-y-4">
        {error && <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm text-danger">{error}</p>}

        {/* State 1: Sedang Memproses / Loading (Tanpa rincian nomor batch di UI) */}
        {isProcessing && (
          <section aria-live="polite" aria-atomic="true" className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-text">Sedang memproses import data siswa…</p>
            <p className="text-xs text-muted">Mohon tunggu sebentar, data sedang disimpan ke database.</p>
          </section>
        )}

        {/* State 2: Selesai */}
        {!isProcessing && status === "COMPLETED" && (
          <section aria-live="polite" aria-atomic="true" className="rounded-lg border border-border bg-soft p-4 space-y-2">
            <div className="flex items-center gap-2 font-medium text-success">
              <span className="text-base font-bold">✓</span>
              <span>Import Siswa Selesai</span>
            </div>
            <p className="text-sm text-text">
              Proses import selesai. Sebanyak <strong>{job?.inserted || 0}</strong> data siswa berhasil ditambahkan ke database.
              {Number(job?.skipped) > 0 && (
                <> Sebanyak <strong>{job.skipped}</strong> data dilewati karena NIS sudah ada.</>
              )}
            </p>
          </section>
        )}

        {/* State 3: Gagal */}
        {!isProcessing && status === "FAILED" && (
          <section aria-live="polite" aria-atomic="true" className="rounded-lg border border-danger/30 bg-danger/10 p-4 space-y-2">
            <div className="flex items-center gap-2 font-medium text-danger">
              <span>Import Terhenti</span>
            </div>
            <p className="text-sm text-danger">
              {error || job?.last_error || "Terjadi kesalahan saat memproses data siswa. Anda dapat mencoba melanjutkan kembali."}
            </p>
          </section>
        )}

        {/* State 4: Form Input & Pratinjau (Hanya tampil saat persiapan sebelum import atau gagal) */}
        {!isProcessing && status !== "COMPLETED" && (
          <>
            <p className="text-sm text-muted">Unggah lembar kerja Excel untuk menambahkan banyak siswa sekaligus.</p>
            <LinkButton href="/api/students/import/template" variant="surface" size="sm" className="w-fit">Unduh template Excel</LinkButton>
            <Field id="student-import-file" label="File Excel" hint="Format .xlsx saja.">
              <input
                id="student-import-file"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(event) => prepare(event.target.files?.[0])}
                className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              />
            </Field>
            {file && <p className="text-sm text-muted">File dipilih: {file.name}</p>}
            {status === "DRAFT" && preview.length === 0 && (
              <p className="text-sm text-muted">Pratinjau sebelumnya tidak tersimpan di browser. Pilih kembali file untuk memeriksa data sebelum konfirmasi.</p>
            )}
            {validationErrors.length > 0 && (
              <Panel title="Perlu diperbaiki" className="max-h-48 overflow-auto">
                <ul className="list-inside list-disc space-y-1 text-sm text-danger">
                  {validationErrors.map((item, index) => (
                    <li key={index}>{typeof item === "string" ? item : item.message || JSON.stringify(item)}</li>
                  ))}
                </ul>
              </Panel>
            )}
            {preview.length > 0 && (
              <Panel title={`Pratinjau (${preview.length} baris)`} className="max-h-64 overflow-auto">
                <DataTable columns={columns} rows={preview} getRowKey={(row, index) => row.id ?? row.studentNumber ?? index} />
              </Panel>
            )}
          </>
        )}

        {/* Footer Actions */}
        <footer className="flex flex-wrap justify-end gap-2 pt-2">
          {status === "COMPLETED" ? (
            <Button type="button" onClick={handleClose}>Selesai</Button>
          ) : isProcessing ? (
            <Button type="button" disabled>Memproses import…</Button>
          ) : status === "FAILED" ? (
            <>
              <Button variant="ghost" type="button" onClick={handleClose}>Tutup</Button>
              <Button variant="surface" type="button" disabled={busy} onClick={resume}>Lanjutkan import</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" type="button" onClick={handleClose}>Tutup</Button>
              {job && !terminal(job) && (
                <Button
                  type="button"
                  disabled={busy || validationErrors.length > 0 || (status === "DRAFT" && preview.length === 0)}
                  onClick={confirm}
                >
                  {busy ? "Memproses…" : "Konfirmasi import"}
                </Button>
              )}
              {busy && !job && <span role="status" className="self-center text-sm text-muted">Memeriksa file…</span>}
            </>
          )}
        </footer>
      </div>
    </Modal>
  );
}
