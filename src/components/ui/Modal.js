"use client";
import { useEffect, useRef } from "react";
import { Button } from "./Button";

export function Modal({ open, onClose, title, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} aria-labelledby="modal-title" className="m-auto w-[min(90vw,520px)] rounded-xl border border-border bg-surface p-6 text-text shadow-xl backdrop:bg-[var(--color-overlay)]" onClose={onClose}>
      <header className="flex items-center justify-between gap-4">
        <h2 id="modal-title" className="font-display text-lg font-semibold">{title}</h2>
        <Button variant="ghost" type="button" onClick={onClose} aria-label="Tutup modal">✕</Button>
      </header>
      <div className="mt-5 space-y-4">{children}</div>
    </dialog>
  );
}
