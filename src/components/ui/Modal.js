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
    <dialog ref={ref} className="modal" onClose={onClose}>
      <header>
        <h2>{title}</h2>
        <Button variant="ghost" type="button" onClick={onClose} aria-label="Tutup modal">✕</Button>
      </header>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
