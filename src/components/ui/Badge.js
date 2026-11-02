export function Badge({ tone = "neutral", children }) {
  const tones = { neutral: "bg-soft text-primary", danger: "bg-danger/10 text-danger", success: "bg-success/10 text-success", hero: "bg-[var(--color-badge-hero)] text-white" };
  return <span className={`inline-flex h-[24px] items-center rounded-full px-[10px] text-xs font-normal ${tones[tone] || tones.neutral}`}>{children}</span>;
}
