export function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5 ${className}`.trim()}>
      {title ? <header className="mb-4 flex items-center justify-between gap-4"><h2 className="font-display text-lg font-semibold">{title}</h2>{action}</header> : null}
      {children}
    </section>
  );
}
