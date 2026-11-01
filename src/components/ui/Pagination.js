import { Button } from "./Button";

export function Pagination({ page, pageSize, total, onPageChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="muted">{total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} dari {total}</span>
      <div className="row">
        <Button variant="ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Sebelumnya</Button>
        <span aria-live="polite">{page} / {pages}</span>
        <Button variant="ghost" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Berikutnya</Button>
      </div>
    </nav>
  );
}
