export function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-border bg-surface p-3.5 shadow-sm sm:p-4 ${className}`.trim()}>
      {title ? <header className="mb-2.5 flex items-center justify-between gap-4"><h2 className="font-display text-sm font-semibold sm:text-base">{title}</h2>{action}</header> : null}
      {children}
    </section>
  );
}
