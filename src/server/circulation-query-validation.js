import { InputError, pagination, searchText } from "./validation.js";

export const CIRCULATION_KINDS = ["borrowings", "returns", "fines", "stock", "borrowing-report", "return-report"];

export function circulationQueryInput(input = {}) {
  if (!CIRCULATION_KINDS.includes(input.kind)) throw new InputError("Jenis data tidak valid");
  const { page, pageSize, offset } = pagination(input);
  const query = searchText(input.q ?? input.query);
  const statuses = {
    borrowings: ["all", "borrowed", "overdue", "returned"],
    returns: ["all", "due", "overdue"],
    fines: ["all", "unpaid", "paid"],
    stock: ["all", "available", "low", "empty"],
    "borrowing-report": ["all", "borrowed", "overdue", "returned"],
    "return-report": ["all", "on-time", "late"],
  }[input.kind];
  const status = input.status || "all";
  if (!statuses.includes(status)) throw new InputError("Status tidak valid");
  const from = optionalDate(input.from, "Tanggal awal");
  const to = optionalDate(input.to, "Tanggal akhir");
  if (from && to && from > to) throw new InputError("Rentang tanggal tidak valid");
  return { kind: input.kind, query, page, pageSize, offset, status, from, to };
}

function optionalDate(value, label) {
  if (!value) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new InputError(`${label} tidak valid`);
  const date = new Date(`${value}T00:00:00Z`);
  if (date.toISOString().slice(0, 10) !== value) throw new InputError(`${label} tidak valid`);
  return value;
}
