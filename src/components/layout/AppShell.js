import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }) {
  return <div className="app-shell"><Sidebar /><div className="main-pane"><Topbar />{children}</div></div>;
}
