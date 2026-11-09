"use client";
import { useEffect, useRef, useState } from "react";
import { RecordList } from "./RecordList";
import { RecordEditor } from "./RecordEditor";
import { StudentImport } from "./StudentImport";

const buildQueryKey = (kind, page, pageSize, search, active, className, categoryId, revision) =>
  JSON.stringify([kind, page, pageSize, search, active, className, categoryId, revision]);

export function RecordsLoader({ kind, initialData, categories }) {
  const hasInitialCategories = Array.isArray(categories);
  const [data, setData] = useState(initialData);
  const [allCategories, setAllCategories] = useState(hasInitialCategories ? categories : []);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [active, setActive] = useState("all");
  const [categoryId, setCategoryId] = useState("");
  const [className, setClassName] = useState("all");
  const [error, setError] = useState("");
  const [editor, setEditor] = useState(undefined);
  const [revision, setRevision] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const lastLoadedKey = useRef(
    initialData ? buildQueryKey(kind, 1, 10, "", "all", "all", "", 0) : null,
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (kind !== "books" || hasInitialCategories || allCategories.length) return undefined;
    const controller = new AbortController();
    fetch("/api/categories?page=1&pageSize=100&active=all", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => { if (result) setAllCategories(result.items || []); })
      .catch(() => {});
    return () => controller.abort();
  }, [kind, hasInitialCategories, allCategories.length]);

  useEffect(() => {
    const queryKey = buildQueryKey(kind, page, pageSize, debouncedSearch, active, className, categoryId, revision);
    if (lastLoadedKey.current === queryKey) return undefined;
    let current = true;
    const abort = new AbortController();
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), query: debouncedSearch,
      ...((kind === "categories" || kind === "students") && active !== "all" ? { active } : {}),
      ...(kind === "students" && className !== "all" ? { className } : {}),
      ...(kind === "books" && categoryId ? { categoryId } : {}) });
    fetch(`/api/${kind}?${params}`, { signal: abort.signal })
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((result) => { if (current) { lastLoadedKey.current = queryKey; setData(result); setError(""); } })
      .catch((failure) => { if (current && failure.name !== "AbortError") setError("Data gagal dimuat. Silakan coba lagi."); });
    return () => { current = false; abort.abort(); };
  }, [kind, page, pageSize, debouncedSearch, active, className, categoryId, revision]);

  return <>
     <RecordList kind={kind} data={data} page={page} pageSize={pageSize} search={search} active={active} className={className} setClassName={setClassName} categories={allCategories} categoryId={categoryId} setCategoryId={setCategoryId} setPage={setPage} setPageSize={setPageSize} setSearch={setSearch} setActive={setActive} onCreate={() => setEditor(null)} onEdit={setEditor} onImport={() => setImportOpen(true)} onRefreshed={() => setRevision((value) => value + 1)} onDeletedStudents={() => setRevision((value) => value + 1)} />
     {kind === "students" && <StudentImport open={importOpen} onClose={() => setImportOpen(false)} onComplete={() => setRevision((value) => value + 1)} />}
    {error && <p role="alert" className="mx-8 mb-4 rounded-lg bg-danger/10 p-3 text-danger">{error}<button onClick={() => setRevision((value) => value + 1)} className="ml-2 underline">Coba lagi</button></p>}
    {editor !== undefined && <RecordEditor kind={kind} record={editor} categories={allCategories} onClose={() => setEditor(undefined)} onSaved={() => { setEditor(undefined); setRevision((value) => value + 1); }} />}
  </>;
}
