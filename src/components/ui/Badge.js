export function Badge({ tone = "neutral", children }) {
  return <span className={`tag ${tone === "neutral" ? "" : tone}`}>{children}</span>;
}
