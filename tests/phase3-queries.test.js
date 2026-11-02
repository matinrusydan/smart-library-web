import test from "node:test";
import assert from "node:assert/strict";
import { circulationQueryInput } from "../src/server/circulation-query-validation.js";
import { InputError } from "../src/server/validation.js";

test("circulation query accepts bounded pagination and filters", () => {
  assert.deepEqual(circulationQueryInput({ kind: "returns", q: "  Siswa ", page: "2", pageSize: "25", status: "overdue", from: "2026-01-01", to: "2026-01-31" }), {
    kind: "returns", query: "Siswa", page: 2, pageSize: 25, offset: 25, status: "overdue", from: "2026-01-01", to: "2026-01-31",
  });
});

test("circulation query rejects invalid kind, status, page size and dates", () => {
  for (const input of [
    { kind: "unknown" },
    { kind: "fines", status: "partial" },
    { kind: "stock", pageSize: "500" },
    { kind: "borrowings", from: "2026-02-30" },
    { kind: "return-report", from: "2026-02-02", to: "2026-02-01" },
  ]) assert.throws(() => circulationQueryInput(input), InputError);
});
