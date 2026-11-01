export function Button({ variant = "primary", className = "", ...props }) {
  return <button className={`btn ${variant === "primary" ? "" : variant} ${className}`.trim()} {...props} />;
}
