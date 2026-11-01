export function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`panel ${className}`.trim()}>
      {title ? <header className="panel-heading"><h2>{title}</h2>{action}</header> : null}
      {children}
    </section>
  );
}
