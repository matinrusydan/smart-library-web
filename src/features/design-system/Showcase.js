"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { Panel } from "@/components/ui/Panel";

const tokenNames = ["primary", "surface", "bg", "text", "muted", "border", "accent", "danger", "success"];
const fixtureRows = Array.from({ length: 6 }, (_, index) => ({ id: index + 1, name: `Komponen ${index + 1}`, state: index % 2 ? "Lunas" : "Belum Lunas" }));
const columns = [{ key: "id", label: "No." }, { key: "name", label: "Nama" }, { key: "state", label: "Status", render: (row) => <Badge tone={row.state === "Lunas" ? "success" : "danger"}>{row.state}</Badge> }];

export function Showcase() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const filtered = fixtureRows.filter((row) => row.name.toLowerCase().includes(keyword.toLowerCase()));
  const pageSize = 3;
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main className="content-area" id="showcase">
      <Panel title="Phase 0 — Component Showcase"><p className="muted">Ini data fixture untuk demonstrasi komponen, bukan data bisnis. Perbandingan visual Figma live masih menunggu verifikasi.</p></Panel>
      <Panel title="Color Tokens"><div className="swatches">{tokenNames.map((name) => <div key={name} className="swatch" style={{ "--swatch": `var(--color-${name})`, "--swatch-ink": name === "primary" ? "var(--prt)" : "var(--ink)" }}>{name}</div>)}</div></Panel>
      <Panel title="Typography"><h1>Judul halaman</h1><h2>Judul panel</h2><p>Teks isi menggunakan Plus Jakarta Sans. Heading menggunakan Bricolage Grotesque.</p></Panel>
      <Panel title="Button & Status"><div className="row"><Button onClick={() => setOpen(true)}>Buka modal</Button><Button variant="ghost">Secondary</Button><Button variant="danger">Danger</Button><Button disabled>Disabled</Button><Badge>Netral</Badge><Badge tone="success">Lunas</Badge><Badge tone="danger">Belum Lunas</Badge></div></Panel>
      <Panel title="Field & Filter Bar"><div className="filter-bar"><Field id="keyword" label="Cari komponen" placeholder="Cari nama..." value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(1); }} /><Field id="classroom" label="Kelas"><select id="classroom" defaultValue="all"><option value="all">Semua kelas</option><option>XI MIPA 2</option></select></Field><Button variant="ghost" onClick={() => { setKeyword(""); setPage(1); }}>Reset</Button></div></Panel>
      <Panel title="Table & Pagination"><DataTable columns={columns} rows={rows} getRowKey={(row) => row.id} /><Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} /></Panel>
      <Modal open={open} onClose={() => setOpen(false)} title="Contoh modal"><p>Halaman di belakang tetap terlihat dengan scrim hitam 50%. Tekan Escape atau tombol tutup.</p><Button onClick={() => setOpen(false)}>Tutup</Button></Modal>
    </main>
  );
}
