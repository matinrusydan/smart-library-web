import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }) {
  return <div className="grid min-h-screen grid-cols-1 min-[861px]:grid-cols-[250px_minmax(0,1fr)]"><Sidebar /><div className="flex min-w-0 flex-col"><Topbar />{children}</div></div>;
}
