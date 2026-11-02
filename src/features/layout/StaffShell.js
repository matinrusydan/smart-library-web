"use client";
import { AppShell } from "@/components/layout/AppShell";
import { usePathname } from "next/navigation";
const titles={"/":"Ringkasan","/buku":"Daftar Buku","/kategori":"Master Kategori","/siswa":"Data Siswa"};
export function StaffShell({user,children}){const path=usePathname();return <AppShell user={user} title={titles[path]||"Smart Library"}>{children}</AppShell>}
