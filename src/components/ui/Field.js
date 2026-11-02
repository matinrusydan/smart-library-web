export function Field({ label, hint, id, children, className = "flex-1", ...props }) {
  return (
    <label className={`flex min-w-0 flex-col gap-1.5 text-sm font-medium ${className}`.trim()} htmlFor={id}>
      <span>{label}</span>
      {children || <input id={id} className="w-full min-w-0 rounded-md border border-border bg-surface px-3 py-2.5 font-normal focus-visible:outline-primary" {...props} />}
      {hint ? <small className="font-normal text-muted">{hint}</small> : null}
    </label>
  );
}
