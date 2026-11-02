import "server-only";
import { db } from "@/lib/db";
import { borrowingInput, calendarDate, jakartaToday, lateFine, paymentInput } from "@/server/validation-circulation";
import { requireUser } from "@/server/auth";
import { InputError, positiveId } from "@/server/validation";

const audit = (trx, userId, action, entityType, entityId, details) => trx("audit_logs").insert({ user_id: userId, action, entity_type: entityType, entity_id: String(entityId), details });

export async function borrowBooks(input) {
  const user = await requireUser(["superadmin", "petugas"]);
  const data = borrowingInput(input);
  const actor = positiveId(user.id, "Petugas");
  return db.transaction(async (trx) => {
    const student = await trx("students").select("id", "is_active").where({ id: data.studentId }).forUpdate().first();
    if (!student || !student.is_active) throw new InputError("Siswa tidak ditemukan atau tidak aktif");
    const books = [];
    for (const item of data.items) {
      const book = await trx("books as b").join("categories as c", "c.id", "b.category_id").select("b.id", "b.stock_available", "c.is_active").where("b.id", item.bookId).forUpdate("b").first();
      if (!book || !book.is_active) throw new InputError("Buku atau kategori tidak ditemukan atau tidak aktif");
      if (Number(book.stock_available) < item.quantity) throw new InputError("Stok buku tidak mencukupi");
      books.push(item);
    }
    const [borrowing] = await trx("borrowings").insert({ student_id: data.studentId, user_id: actor, borrowed_at: data.borrowedAt, due_at: data.dueAt, status: "borrowed" }).returning(["id"]);
    for (const item of books) {
      await trx("books").where({ id: item.bookId }).decrement("stock_available", item.quantity);
      await trx("borrowing_items").insert({ borrowing_id: borrowing.id, book_id: item.bookId, quantity: item.quantity });
    }
    await audit(trx, actor, "borrowing.created", "borrowing", borrowing.id, { studentId: data.studentId, dueAt: data.dueAt, items: books });
    return { success: true, id: borrowing.id, dueAt: data.dueAt };
  });
}

export async function returnBorrowing(borrowingId, returnedAt = jakartaToday()) {
  const user = await requireUser(["superadmin", "petugas"]);
  const id = positiveId(borrowingId, "Peminjaman");
  const actor = positiveId(user.id, "Petugas");
  const date = calendarDate(returnedAt, "Tanggal pengembalian");
  return db.transaction(async (trx) => {
    const borrowing = await trx("borrowings").select("id", "student_id").select(trx.raw("to_char(borrowed_at, 'YYYY-MM-DD') AS borrowed_date"), trx.raw("to_char(due_at, 'YYYY-MM-DD') AS due_date"), trx.raw("to_char(returned_at, 'YYYY-MM-DD') AS returned_date")).where({ id }).forUpdate().first();
    if (!borrowing) throw new InputError("Peminjaman tidak ditemukan");
    if (borrowing.returned_date) return { success: true, alreadyReturned: true, fineAmount: 0 };
    if (date < borrowing.borrowed_date) throw new InputError("Tanggal pengembalian tidak boleh sebelum peminjaman");
    const items = await trx("borrowing_items").select("book_id", "quantity").where({ borrowing_id: id }).orderBy("book_id", "asc");
    for (const item of items) {
      await trx("books").where({ id: item.book_id }).increment("stock_available", item.quantity);
    }
    const amount = lateFine(borrowing.due_date, date);
    await trx("borrowings").where({ id }).update({ returned_at: date, status: "returned", updated_at: trx.fn.now() });
    let fineId = null;
    if (amount > 0) {
      const [fine] = await trx("fines").insert({ borrowing_id: id, student_id: borrowing.student_id, amount, paid_amount: 0, reason: `Keterlambatan ${amount / 1000} hari`, status: "unpaid" }).returning(["id"]);
      fineId = fine.id;
    }
    await audit(trx, actor, "borrowing.returned", "borrowing", id, { returnedAt: date, fineAmount: amount, fineId });
    return { success: true, fineAmount: amount, fineId };
  });
}

export async function payFine(input) {
  const user = await requireUser(["superadmin", "petugas"]);
  const { fineId, amount, method, reference } = paymentInput(input);
  const actor = positiveId(user.id, "Petugas");
  return db.transaction(async (trx) => {
    const fine = await trx("fines").where({ id: fineId }).forUpdate().first();
    if (!fine) throw new InputError("Denda tidak ditemukan");
    if (fine.status === "paid" || Number(fine.paid_amount) > 0) throw new InputError("Denda sudah dibayar");
    if (amount !== Number(fine.amount)) throw new InputError("Pembayaran harus sesuai jumlah denda");
    const [payment] = await trx("payments").insert({ fine_id: fineId, user_id: actor, amount, method, reference }).returning(["id"]);
    await trx("fines").where({ id: fineId }).update({ paid_amount: amount, status: "paid", updated_at: trx.fn.now() });
    await audit(trx, actor, "fine.paid", "fine", fineId, { amount, paymentId: payment.id });
    return { success: true, paymentId: payment.id };
  });
}
