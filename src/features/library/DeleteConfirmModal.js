"use client";
import { useState } from "react";
import {
  deleteBooksBulkAction,
  deleteCategoriesBulkAction,
  deleteStudentsBulkAction,
} from "@/app/actions/library";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";

export const DELETE_CONFIG = {
  books: {
    label: "buku",
    title: "Buku",
    action: deleteBooksBulkAction,
    constraintNotice: "Buku yang memiliki riwayat peminjaman tidak akan dapat dihapus.",
  },
  categories: {
    label: "kategori",
    title: "Kategori",
    action: deleteCategoriesBulkAction,
    constraintNotice: "Kategori yang masih memiliki koleksi buku tidak akan dapat dihapus.",
  },
  students: {
    label: "siswa",
    title: "Siswa",
    action: deleteStudentsBulkAction,
    constraintNotice: "Siswa yang memiliki riwayat peminjaman atau denda tidak akan dapat dihapus.",
  },
};

export function DeleteConfirmModal({
  kind = "students",
  selectedIds = [],
  action: customAction,
  label: customLabel,
  title: customTitle,
  constraintNotice: customNotice,
  onClose,
  onDeleted,
}) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const config = DELETE_CONFIG[kind] || DELETE_CONFIG.students;
  const actionFn = customAction || config.action;
  const label = customLabel || config.label;
  const constraintNotice = customNotice || config.constraintNotice;
  const count = selectedIds.length;
  const defaultTitle = count === 1 ? `Hapus ${label}` : `Hapus ${label} terpilih`;
  const modalTitle = customTitle || defaultTitle;

  async function submit(event) {
    event.preventDefault();
    if (confirmation !== "HAPUS" || count === 0) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("confirmation", confirmation);
      selectedIds.forEach((id) => form.append("ids", String(id)));
      const result = await actionFn(form);
      if (result?.error) {
        setError(result.error);
      } else {
        onDeleted?.(result?.count ?? count);
      }
    } catch {
      setError("Penghapusan gagal. Silakan coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={busy ? () => {} : onClose} title={modalTitle}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted">
          Anda akan menghapus{" "}
          <strong className="text-text">
            {count} {label}
          </strong>
          . Tindakan ini tidak dapat dibatalkan. {constraintNotice}
        </p>
        <Field
          label={
            <>
              Ketik <strong>HAPUS</strong> untuk mengonfirmasi
            </>
          }
          id="delete-confirmation-input"
        >
          <input
            id="delete-confirmation-input"
            autoComplete="off"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="Ketik HAPUS"
            className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-danger"
          />
        </Field>
        {error && (
          <p role="alert" className="rounded-lg bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="danger-solid"
            disabled={busy || confirmation !== "HAPUS"}
          >
            {busy ? "Menghapus…" : `Hapus ${count} ${label}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default DeleteConfirmModal;
