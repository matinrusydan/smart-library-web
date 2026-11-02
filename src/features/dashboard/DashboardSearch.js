"use client";
import { useState } from "react";

const sources = [
  { label: "Buku", endpoint: "/api/books", href: "/buku", fields: ["title", "author", "isbn"] },
  { label: "Kategori", endpoint: "/api/categories", href: "/kategori", fields: ["name", "description"] },
  { label: "Siswa", endpoint: "/api/students", href: "/siswa", fields: ["name", "studentNumber", "className"] },
];

export function DashboardSearch({ compact = false }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const term = query.trim();
    if (!term) { setResults([]); setSearched(false); setError(""); return; }
    setLoading(true); setError(""); setSearched(true);
    try {
      const groups = await Promise.all(sources.map(async source => {
        const params = new URLSearchParams({ query: term, page: "1", pageSize: "10" });
        const response = await fetch(`${source.endpoint}?${params}`);
        if (!response.ok) throw new Error("Pencarian belum dapat dimuat.");
        const payload = await response.json();
        return payload.items.map(item => ({ ...item, source: source.label, href: source.href, text: source.fields.map(field => item[field]).filter(Boolean).join(" · ") }));
      }));
      setResults(groups.flat());
    } catch { setResults([]); setError("Pencarian gagal. Periksa koneksi lalu coba lagi."); }
    finally { setLoading(false); }
  }

  return <section className={compact ? "relative min-w-0 flex-1 max-w-[280px]" : "rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5"}><form onSubmit={submit} className={compact ? "flex items-center" : "flex flex-col gap-3 sm:flex-row sm:items-end"}><label htmlFor="dashboard-search" className={compact ? "flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-muted" : "min-w-0 flex-1 text-sm font-medium"}>{compact&&<svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>}{!compact&&"Cari buku, kategori, atau siswa"}<input id="dashboard-search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={compact?"Cari buku, kategori, atau siswa…":"Masukkan kata kunci"} className={compact ? "min-w-0 flex-1 border-0 bg-transparent py-2 text-xs text-text outline-none placeholder:text-muted focus:ring-0" : "mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2.5 font-normal"} /></label>{!compact&&<button disabled={loading} className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-on-primary disabled:opacity-60">{loading?"Mencari…":"Cari"}</button>}{compact&&<button aria-label="Cari" disabled={loading} className="sr-only">Cari</button>}</form>{error&&<p role="alert" className="mt-3 text-sm text-danger">{error}</p>}{loading&&<p className="mt-3 text-sm text-muted" aria-live="polite">Mencari data…</p>}{searched&&!loading&&!error&&<div className={compact ? "absolute right-0 top-full z-30 mt-2 max-h-72 w-[min(88vw,360px)] overflow-y-auto rounded-lg border border-border bg-surface p-3 shadow-lg" : "mt-4 border-t border-border pt-3"} aria-live="polite"><p className="mb-2 text-sm text-muted">{results.length?`${results.length} hasil teratas`:"Tidak ada hasil yang cocok."}</p><ul className="divide-y divide-border">{results.map(result=><li key={`${result.source}-${result.id}`}><a href={result.href} className="flex flex-wrap items-center justify-between gap-2 py-2 hover:text-primary"><span className="font-medium">{result.text||result.source}</span><span className="text-xs text-muted">{result.source} →</span></a></li>)}</ul></div>}</section>;
}
