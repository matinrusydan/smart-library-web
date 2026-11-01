export function Field({ label, hint, id, children, ...props }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      {children || <input id={id} {...props} />}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}
