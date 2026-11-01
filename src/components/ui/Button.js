export function Button({ variant = "primary", className = "", ...props }) {
  const variants = { primary: "border-transparent bg-primary text-on-primary hover:brightness-110", ghost: "border-border bg-transparent text-primary hover:bg-soft", danger: "border-border bg-transparent text-danger hover:bg-soft" };
  return <button className={`inline-flex min-h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${className}`.trim()} {...props} />;
}
