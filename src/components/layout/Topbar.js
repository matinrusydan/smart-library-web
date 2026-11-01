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
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-4 sm:px-8">
      <div><h1 className="font-display text-2xl font-bold sm:text-3xl">Design System</h1><p className="text-sm text-muted">Fondasi UI Smart Library</p></div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-muted">Petugas</span>
        <Button variant="ghost" onClick={toggleTheme} aria-label="Ganti tema">{theme === "light" ? "Mode gelap" : "Mode terang"}</Button>
      </div>
    </header>
  );
}
