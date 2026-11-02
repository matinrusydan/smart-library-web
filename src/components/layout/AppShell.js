import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children, user, title }) {
  return <div className="grid min-h-screen grid-cols-1 min-[861px]:grid-cols-[var(--sidebar-w)_minmax(0,1fr)]"><Sidebar user={user} /><div className="flex min-w-0 flex-col gap-[20px] px-[20px] pt-[22px] pb-[48px] min-[861px]:px-[32px]"><Topbar user={user} title={title} /><div className="min-w-0 flex-1">{children}</div><footer className="w-full text-xs text-muted">Digital Library <span className="mx-1 text-border">/</span> Sistem Informasi Perpustakaan Sekolah</footer></div></div>;
}
