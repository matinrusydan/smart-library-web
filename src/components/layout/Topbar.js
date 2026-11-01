"use client";
import { useSyncExternalStore } from "react";
import { Button } from "../ui/Button";

function subscribe(callback) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function getSnapshot() {
  return document.documentElement.dataset.theme || "light";
}
function getServerSnapshot() {
  return "light";
}

export function Topbar() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("smart-library-theme", next);
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <header className="topbar">
      <div><h1 className="page-title">Design System</h1><p className="page-subtitle">Fondasi UI Smart Library</p></div>
      <div className="row">
        <span className="muted">Petugas</span>
        <Button variant="ghost" onClick={toggleTheme} aria-label="Ganti tema">{theme === "light" ? "Mode gelap" : "Mode terang"}</Button>
      </div>
    </header>
  );
}
