export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <nav className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3" aria-label="Paginasi">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <label htmlFor="page-size">Menampilkan</label>
        <select id="page-size" value={pageSize} onChange={(event) => { onPageSizeChange(Number(event.target.value)); onPageChange(1); }} className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-text">
          {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
        <span>{total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} dari {total}</span>
      </div>
      <div className="flex flex-wrap items-center gap-[6px]">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="inline-flex h-[34px] items-center gap-[6px] rounded-[6px] border border-border bg-surface px-[12px] py-[7px] text-[14px] font-medium text-muted disabled:cursor-not-allowed disabled:opacity-50 hover:bg-bg"><span aria-hidden="true">‹</span>Sebelumnya</button>
        {Array.from({ length: Math.min(pages, 3) }, (_, index) => Math.max(1, Math.min(page - 1, pages - 2)) + index).map((number) => <button type="button" key={number} aria-current={number === page ? "page" : undefined} onClick={() => onPageChange(number)} className={`inline-flex items-center justify-center rounded-[6px] border px-[11px] py-[6px] text-[14px] leading-normal ${number === page ? "border-primary bg-primary font-semibold text-on-primary" : "border-border bg-surface hover:bg-bg"}`}>{number}</button>)}
        <button type="button" disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="inline-flex h-[34px] items-center gap-[6px] rounded-[6px] border border-border bg-surface px-[12px] py-[7px] text-[14px] font-medium text-muted disabled:cursor-not-allowed disabled:opacity-50 hover:bg-bg"><span aria-hidden="true">›</span>Berikutnya</button>
      </div>
    </nav>
  );
}
