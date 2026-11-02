import "server-only";
import { db } from "@/lib/db";
import { requireUser } from "@/server/auth";
import { circulationQueryInput } from "./circulation-query-validation.js";
import { jakartaToday, lateFine } from "./validation-circulation.js";

const date = (column) => db.raw("to_char(??, 'YYYY-MM-DD')", [column]);
const big = (value) => value == null ? null : String(value);
const escapeLike = (value) => value.replace(/[\\%_]/g, "\\$&");

function baseBorrowings(input, today) {
  const q = db("borrowings as br").join("students as st", "st.id", "br.student_id");
  if (input.kind === "returns" || input.kind === "borrowings") q.whereNull("br.returned_at");
  if (input.kind === "return-report") q.whereNotNull("br.returned_at");
  if (input.status !== "all") {
    if (input.status === "borrowed") q.whereNull("br.returned_at").where("br.due_at", ">=", today);
    else if (input.status === "due") q.where("br.due_at", ">=", today);
    else if (input.status === "overdue") q.whereNull("br.returned_at").where("br.due_at", "<", today);
    else if (input.status === "returned") q.whereNotNull("br.returned_at");
    else if (input.status === "late") q.whereRaw("br.returned_at > br.due_at");
    else if (input.status === "on-time") q.whereRaw("br.returned_at <= br.due_at");
  }
  const selectedDate = input.kind === "return-report" ? "br.returned_at" : "br.borrowed_at";
  if (input.from) q.where(selectedDate, ">=", input.from);
  if (input.to) q.where(selectedDate, "<=", input.to);
  if (input.query) {
    const term = `%${escapeLike(input.query)}%`;
    q.where((sub) => sub.whereILike("st.name", term).orWhereILike("st.student_number", term).orWhereExists(function () {
      this.select(db.raw("1")).from("borrowing_items as bi").join("books as bk", "bk.id", "bi.book_id").whereRaw("bi.borrowing_id = br.id").whereILike("bk.title", term);
    }));
  }
  return q;
}

async function loanPage(input, today) {
  const base = baseBorrowings(input, today);
  const [summaryRow, fineTotal, rows] = await Promise.all([
    base.clone().select(
      db.raw("count(br.id)::int as total_borrowings"),
      db.raw("count(br.id) filter (where br.returned_at is null)::int as active_borrowings"),
      db.raw("count(br.id) filter (where br.returned_at is null and br.due_at < ?)::int as overdue_borrowings", [today]),
    ).first(),
    db("fines as f").whereIn("f.borrowing_id", base.clone().clearSelect().clearOrder().select("br.id")).sum({ total_fine: "f.amount" }).first(),
    base.clone().select("br.id", "br.student_id", "st.name as student_name", "st.student_number", "st.class_name", "br.status")
      .select({ borrowed_at: date("br.borrowed_at"), due_at: date("br.due_at"), returned_at: date("br.returned_at") })
      .select(db.raw("coalesce((select sum(f.amount) from fines f where f.borrowing_id = br.id), 0)::bigint as fine_amount"))
      .orderBy(input.kind === "return-report" ? "br.returned_at" : "br.borrowed_at", "desc").orderBy("br.id", "desc").limit(input.pageSize).offset(input.offset),
  ]);
  const ids = rows.map((row) => row.id);
  const items = ids.length ? await db("borrowing_items as bi").join("books as b", "b.id", "bi.book_id")
    .select("bi.borrowing_id", "bi.book_id", "b.title", "bi.quantity").whereIn("bi.borrowing_id", ids).orderBy("bi.id") : [];
  const itemMap = new Map();
  for (const item of items) {
    const key = big(item.borrowing_id);
    if (!itemMap.has(key)) itemMap.set(key, []);
    itemMap.get(key).push({ bookId: big(item.book_id), title: item.title, quantity: Number(item.quantity) });
  }
  return { items: rows.map((row) => {
    const overdueDays = Math.max(0, Math.round(lateFine(row.due_at, row.returned_at || today) / 1000));
    const outstandingDays = Math.max(0, Math.round(lateFine(row.due_at, today) / 1000));
    return { id: big(row.id), studentId: big(row.student_id), studentName: row.student_name, studentNumber: row.student_number, className: row.class_name, borrowedAt: row.borrowed_at, dueAt: row.due_at, returnedAt: row.returned_at, status: row.returned_at ? "returned" : row.due_at < today ? "overdue" : "borrowed", items: itemMap.get(big(row.id)) || [], overdueDays, projectedFine: !row.returned_at ? outstandingDays * 1000 : 0, ...(input.kind === "return-report" ? { condition: null, fine: Number(row.fine_amount), fineAmount: Number(row.fine_amount) } : {}) };
  }), total: Number(summaryRow.total_borrowings), summary: input.kind === "return-report" ? { totalReturns: Number(summaryRow.total_borrowings), totalFine: Number(fineTotal.total_fine || 0), totalFines: Number(fineTotal.total_fine || 0), lostBooks: null } : input.kind === "borrowing-report" ? { totalBorrowings: Number(summaryRow.total_borrowings), activeBorrowings: Number(summaryRow.active_borrowings), overdueBorrowings: Number(summaryRow.overdue_borrowings), currentlyBorrowed: Number(summaryRow.active_borrowings), overdue: Number(summaryRow.overdue_borrowings) } : undefined };
}

async function finePage(input) {
  const base = db("fines as f").join("students as st", "st.id", "f.student_id").join("borrowings as br", "br.id", "f.borrowing_id");
  if (input.status !== "all") base.where("f.status", input.status);
  if (input.from) base.where("br.returned_at", ">=", input.from);
  if (input.to) base.where("br.returned_at", "<=", input.to);
  if (input.query) {
    const term = `%${escapeLike(input.query)}%`;
    base.where((q) => q.whereILike("st.name", term).orWhereILike("st.student_number", term));
  }
  const [summaryRow, rows] = await Promise.all([
    base.clone().select(
      db.raw("count(f.id)::int as total_records"), db.raw("coalesce(sum(f.amount), 0)::bigint as total_amount"),
      db.raw("coalesce(sum(f.paid_amount), 0)::bigint as paid_amount"), db.raw("coalesce(sum(f.amount - f.paid_amount), 0)::bigint as unpaid_amount"),
      db.raw("count(f.id) filter (where f.status = 'paid')::int as paid_count"), db.raw("count(f.id) filter (where f.status <> 'paid')::int as unpaid_count"),
    ).first(),
    base.clone().select("f.id", "f.borrowing_id", "st.name as student_name", "st.student_number", "f.amount", "f.paid_amount", "f.status", "f.reason")
      .select({ returned_at: date("br.returned_at") })
      .select(db.raw("(select string_agg(b.title, ', ' order by b.title) from borrowing_items bi join books b on b.id = bi.book_id where bi.borrowing_id = f.borrowing_id) as book_title"))
      .orderBy("f.id", "desc").limit(input.pageSize).offset(input.offset),
  ]);
  return { total: Number(summaryRow.total_records), summary: { totalAmount: Number(summaryRow.total_amount), totalFines: Number(summaryRow.total_amount), paidAmount: Number(summaryRow.paid_amount), unpaidAmount: Number(summaryRow.unpaid_amount), totalRecords: Number(summaryRow.total_records), fineCount: Number(summaryRow.total_records), paidCount: Number(summaryRow.paid_count), unpaidCount: Number(summaryRow.unpaid_count) }, items: rows.map((row) => ({ id: big(row.id), borrowingId: big(row.borrowing_id), studentName: row.student_name, studentNumber: row.student_number, bookTitle: row.book_title, returnedAt: row.returned_at, amount: Number(row.amount), paidAmount: Number(row.paid_amount), status: row.status, reason: row.reason })) };
}

async function stockPage(input) {
  const base = db("books as b").join("categories as c", "c.id", "b.category_id");
  if (input.status === "empty") base.where("b.stock_available", 0);
  else if (input.status === "low") base.whereBetween("b.stock_available", [1, 2]);
  else if (input.status === "available") base.where("b.stock_available", ">", 2);
  if (input.query) {
    const term = `%${escapeLike(input.query)}%`;
    base.where((q) => q.whereILike("b.title", term).orWhereILike("b.isbn", term).orWhereILike("c.name", term));
  }
  const [summaryRow, rows] = await Promise.all([
    base.clone().select(db.raw("count(b.id)::int as total_titles"), db.raw("coalesce(sum(b.stock_total), 0)::bigint as total_copies"), db.raw("coalesce(sum(b.stock_available), 0)::bigint as available_copies")).first(),
    base.clone().select("b.id", "b.title", "b.isbn", "c.name as category", "b.stock_total", "b.stock_available")
      .orderBy("b.title").orderBy("b.id").limit(input.pageSize).offset(input.offset),
  ]);
  return { total: Number(summaryRow.total_titles), summary: { totalTitles: Number(summaryRow.total_titles), totalCopies: Number(summaryRow.total_copies), availableCopies: Number(summaryRow.available_copies) }, items: rows.map((row) => ({ id: big(row.id), code: row.isbn || big(row.id), title: row.title, isbn: row.isbn, category: row.category, stockTotal: Number(row.stock_total), stockAvailable: Number(row.stock_available), borrowed: Number(row.stock_total) - Number(row.stock_available) })) };
}

export async function listCirculation(args = {}) {
  await requireUser(["superadmin", "petugas"]);
  const input = circulationQueryInput(args);
  const today = jakartaToday();
  const result = input.kind === "fines" ? await finePage(input) : input.kind === "stock" ? await stockPage(input) : await loanPage(input, today);
  return { ...result, page: input.page, pageSize: input.pageSize, pageCount: Math.ceil(result.total / input.pageSize) };
}
