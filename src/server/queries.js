import "server-only";
import { db } from "@/lib/db";
import { requireUser } from "./auth";
import { pagination, searchText, positiveId } from "./validation";

async function list(table, args, columns, filter) {
  await requireUser(["superadmin", "petugas"]);
  const { page, pageSize, offset } = pagination(args);
  const query = searchText(args.query);
  const base = db(table);
  if (query) filter(base, query, args);
  if (table === "students" && args.className && args.className !== "all") {
    const className = searchText(args.className);
    if (className) base.where("class_name", className);
  }
  if (["categories", "students"].includes(table) && args.active !== undefined && args.active !== "all") {
    if (![true, false, "true", "false"].includes(args.active)) throw new Error("INVALID_FILTER");
    base.where("is_active", args.active === true || args.active === "true");
  }
  if (table === "books" && args.categoryId) base.where("category_id", positiveId(args.categoryId, "Kategori"));
  const [countRow, items] = await Promise.all([
    base.clone().count({ count: "*" }).first(),
    base.clone().select(columns).orderBy(table === "books" ? "title" : "name").orderBy("id").limit(pageSize).offset(offset),
  ]);
  const total = Number(countRow.count);
  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export async function listBooks(args = {}) {
  return list("books", args, ["id", "category_id as categoryId", "isbn", "title", "author", "publisher", "publication_year as publicationYear", "stock_total as stockTotal", "stock_available as stockAvailable"], (q, term) => q.where((where) => where.whereILike("title", `%${term}%`).orWhereILike("author", `%${term}%`).orWhereILike("isbn", `%${term}%`)));
}

export async function listCategories(args = {}) {
  return list("categories", args, ["id", "name", "description", "is_active as isActive"], (q, term) => q.where((where) => where.whereILike("name", `%${term}%`).orWhereILike("description", `%${term}%`)));
}

export async function listStudents(args = {}) {
  return list("students", args, ["id", "student_number as studentNumber", "name", "class_name as className", "email", "phone", "is_active as isActive"], (q, term) => q.where((where) => where.whereILike("name", `%${term}%`).orWhereILike("student_number", `%${term}%`).orWhereILike("class_name", `%${term}%`)));
}

export async function getDashboardSummary() {
  await requireUser(["superadmin", "petugas"]);
  const [[counts], recentBorrowings] = await Promise.all([
    db.select({
      bookCopies: db("books").sum("stock_total"),
      bookTitles: db("books").count("*"),
      activeCategories: db("categories").where("is_active", true).count("*"),
      activeStudents: db("students").where("is_active", true).count("*"),
      activeBorrowings: db("borrowings").whereIn("status", ["borrowed", "overdue"]).count("*"),
      overdueBorrowings: db("borrowings").where("status", "overdue").count("*"),
      // Low stock means 1-2 available copies; zero-stock books are out of stock, not low stock.
      lowStockBooks: db("books").whereBetween("stock_available", [1, 2]).count("*"),
      returnedBorrowings: db("borrowings").where("status", "returned").count("*"),
    }),
    db("borrowings as br")
      .join("students as st", "st.id", "br.student_id")
      .select("br.id", "st.name as studentName", "br.borrowed_at as borrowedAt", "br.status")
      // A scalar ordered subquery yields one title per borrowing instead of duplicating rows for multi-book loans.
      .select(
        db("borrowing_items as bi")
          .join("books as b", "b.id", "bi.book_id")
          .whereRaw("bi.borrowing_id = br.id")
          .select("b.title")
          .orderBy("bi.id")
          .first()
          .as("bookTitle"),
      )
      .orderBy("br.borrowed_at", "desc")
      .orderBy("br.id", "desc")
      .limit(6),
  ]);
  return {
    bookCopies: Number(counts?.bookCopies || 0),
    bookTitles: Number(counts?.bookTitles || 0),
    activeCategories: Number(counts?.activeCategories || 0),
    activeStudents: Number(counts?.activeStudents || 0),
    activeBorrowings: Number(counts?.activeBorrowings || 0),
    overdueBorrowings: Number(counts?.overdueBorrowings || 0),
    lowStockBooks: Number(counts?.lowStockBooks || 0),
    returnedBorrowings: Number(counts?.returnedBorrowings || 0),
    recentBorrowings: recentBorrowings.map((borrowing) => ({
      id: borrowing.id,
      studentName: borrowing.studentName,
      bookTitle: borrowing.bookTitle || "",
      borrowedAt: borrowing.borrowedAt,
      status: borrowing.status,
    })),
  };
}
