import { InputError, positiveId } from "./validation.js";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function calendarDate(value, label = "Tanggal") {
  if (typeof value !== "string" || !DATE.test(value)) throw new InputError(`${label} tidak valid`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new InputError(`${label} tidak valid`);
  return value;
}

export function jakartaToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  return `${parts.find((part) => part.type === "year").value}-${parts.find((part) => part.type === "month").value}-${parts.find((part) => part.type === "day").value}`;
}

export function addCalendarDays(dateValue, days) {
  const date = new Date(`${calendarDate(dateValue)}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function lateFine(dueAt, returnedAt) {
  const due = calendarDate(dueAt, "Tanggal jatuh tempo");
  const returned = calendarDate(returnedAt, "Tanggal pengembalian");
  const days = Math.max(0, (Date.parse(`${returned}T00:00:00Z`) - Date.parse(`${due}T00:00:00Z`)) / 86_400_000);
  return days * 1000;
}

export function borrowingInput(value = {}) {
  const studentId = positiveId(value.studentId, "Siswa");
  const borrowedAt = calendarDate(value.borrowedAt || jakartaToday(), "Tanggal peminjaman");
  const items = value.items;
  if (!Array.isArray(items) || items.length < 1 || items.length > 50) throw new InputError("Daftar buku tidak valid");
  const unique = new Set();
  const books = items.map((item) => {
    const bookId = positiveId(item?.bookId, "Buku");
    const quantity = Number(item?.quantity);
    if (unique.has(bookId) || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100) throw new InputError("Jumlah buku tidak valid atau buku duplikat");
    unique.add(bookId);
    return { bookId, quantity };
  }).sort((a, b) => BigInt(a.bookId) < BigInt(b.bookId) ? -1 : 1);
  return { studentId, borrowedAt, dueAt: addCalendarDays(borrowedAt, 7), items: books };
}

export function paymentInput(value = {}) {
  const amount = value.amount;
  if (!(typeof amount === "number" || (typeof amount === "string" && /^\d+$/.test(amount))) || !Number.isSafeInteger(Number(amount)) || Number(amount) <= 0) throw new InputError("Jumlah pembayaran tidak valid");
  const optionalText = (input, label, max) => {
    if (input == null || input === "") return null;
    if (typeof input !== "string" || input.trim().length > max) throw new InputError(`${label} tidak valid`);
    return input.trim() || null;
  };
  return {
    fineId: positiveId(value.fineId, "Denda"),
    amount: Number(amount),
    method: optionalText(value.method, "Metode pembayaran", 30),
    reference: optionalText(value.reference, "Referensi pembayaran", 120),
  };
}
