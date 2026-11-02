export function Button({ variant = "primary", size = "md", className = "", ...props }) {
  const variants = { primary: "border-transparent bg-primary text-on-primary hover:brightness-110", surface: "border-transparent bg-surface text-primary shadow-sm hover:bg-bg", ghost: "border-border bg-transparent text-primary hover:bg-soft", danger: "border-border bg-transparent text-danger hover:bg-soft" };
  const sizes = { sm: "h-[37px] px-[16px] text-[13px]", md: "min-h-10 px-4 py-2 text-sm" };
  return <button className={`inline-flex items-center justify-center rounded-md border font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`.trim()} {...props} />;
}

export function LinkButton({ href, variant = "primary", size = "md", className = "", children, ...props }) {
  const variants = { primary: "border-transparent bg-primary text-on-primary hover:brightness-110", surface: "border-transparent bg-surface text-primary shadow-sm hover:bg-bg", ghost: "border-border bg-transparent text-primary hover:bg-soft" };
  const sizes = { sm: "h-[37px] px-[16px] text-[13px]", md: "min-h-10 px-4 py-2 text-sm" };
  return <a href={href} className={`inline-flex items-center justify-center rounded-md border font-semibold transition ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`.trim()} {...props}>{children}</a>;
}
