export function Badge({ tone = "neutral", children }) {
  const tones = { neutral: "bg-soft text-primary", danger: "bg-danger/10 text-danger", success: "bg-success/10 text-success" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.neutral}`}>{children}</span>;
}
