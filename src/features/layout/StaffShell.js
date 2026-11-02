"use client";
import { AppShell } from "@/components/layout/AppShell";
import { usePathname } from "next/navigation";
const titles={"/":"Ringkasan","/buku":"Daftar Buku","/kategori":"Master Kategori","/siswa":"Data Siswa","/peminjaman":"Peminjaman","/pengembalian":"Pengembalian","/denda":"Denda & Pembayaran","/monitoring-stok":"Monitoring Stok","/laporan-peminjaman":"Laporan Peminjaman","/laporan-pengembalian":"Laporan Pengembalian"};
export function StaffShell({user,children}){const path=usePathname();return <AppShell user={user} title={titles[path]||"Smart Library"}>{children}</AppShell>}
