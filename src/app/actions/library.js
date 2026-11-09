"use server";
import { db } from "@/lib/db";
import { requireUser } from "@/server/auth";
import { availableAfterStockEdit, bookBulkDeleteInput, bookInput, categoryBulkDeleteInput, categoryInput, formObject, positiveId, studentBulkDeleteInput, studentInput } from "@/server/validation";

async function save(table, payload, id) {
  await requireUser(["superadmin", "petugas"]);
  try {
    if (id) {
      const updated = await db(table).where({ id: positiveId(id) }).update({ ...payload, updated_at: db.fn.now() }).returning("id");
      if (!updated.length) return { error: "Data tidak ditemukan" };
      return { success: true, id: updated[0].id };
    }
    const created = await db(table).insert(payload).returning("id");
    return { success: true, id: created[0].id };
  } catch (error) {
    if (["23505", "23503", "23514"].includes(error.code)) return { error: error.code === "23503" ? "Referensi data tidak valid" : "Data melanggar aturan atau sudah digunakan" };
    throw error;
  }
}

function action(operation) {
  return async (_previousState, formData) => {
    await requireUser(["superadmin", "petugas"]);
    try {
      const values = formObject(formData);
      const id = values.id || null;
      delete values.id;
      return await operation(values, id);
    } catch (error) {
      if (error.name === "InputError") return { error: error.message };
      throw error;
    }
  };
}

export async function saveBookAction(previousState, formData) {
  return action(async (values, id) => {
    const payload = bookInput(values);
    if (!id) return save("books", { ...payload, stock_available: payload.stock_total }, null);
    const bookId = positiveId(id);
    const expectedTotal = Number(values.expectedStockTotal);
    if (!Number.isSafeInteger(expectedTotal) || expectedTotal < 0) return { error: "Data stok sudah berubah. Muat ulang daftar buku." };
    await requireUser(["superadmin", "petugas"]);
    try {
      return await db.transaction(async (trx) => {
        const current = await trx("books").select("stock_total", "stock_available").where({ id: bookId }).forUpdate().first();
        if (!current) return { error: "Data tidak ditemukan" };
        if (Number(current.stock_total) !== expectedTotal) return { error: "Data stok sudah berubah. Muat ulang daftar buku." };
        const available = availableAfterStockEdit(Number(current.stock_total), Number(current.stock_available), payload.stock_total);
        const [updated] = await trx("books").where({ id: bookId }).update({ ...payload, stock_available: available, updated_at: trx.fn.now() }).returning("id");
        return { success: true, id: updated.id };
      });
    } catch (error) {
      if (error.name === "InputError") return { error: error.message };
      if (["23505", "23503", "23514"].includes(error.code)) return { error: error.code === "23503" ? "Referensi data tidak valid" : "Data melanggar aturan atau sudah digunakan" };
      throw error;
    }
  })(previousState, formData);
}
export async function saveCategoryAction(previousState, formData) {
  return action((values, id) => save("categories", categoryInput(values), id))(previousState, formData);
}
export async function saveStudentAction(previousState, formData) {
  return action((values, id) => save("students", studentInput(values), id))(previousState, formData);
}

export async function setCategoryActiveAction(formData) {
  await requireUser(["superadmin", "petugas"]);
  try { const id = positiveId(formData.get("id")); const active = formData.get("isActive"); if (!["true", "false"].includes(active)) return { error: "Status kategori tidak valid" }; const count = await db("categories").where({ id }).update({ is_active: active === "true", updated_at: db.fn.now() }); return count ? { success: true } : { error: "Data tidak ditemukan" }; }
  catch (error) { if (error.name === "InputError") return { error: error.message }; throw error; }
}

export async function setStudentActiveAction(formData) {
  await requireUser(["superadmin", "petugas"]);
  try { const id = positiveId(formData.get("id")); const active = formData.get("isActive"); if (!["true", "false"].includes(active)) return { error: "Status siswa tidak valid" }; const count = await db("students").where({ id }).update({ is_active: active === "true", updated_at: db.fn.now() }); return count ? { success: true } : { error: "Data tidak ditemukan" }; }
  catch (error) { if (error.name === "InputError") return { error: error.message }; throw error; }
}

export async function deleteBooksBulkAction(formData) {
  const user = await requireUser(["superadmin", "petugas"]);
  try {
    const ids = bookBulkDeleteInput({
      confirmation: formData.get("confirmation"),
      ids: formData.getAll("ids"),
    });

    return await db.transaction(async (trx) => {
      const activeItems = await trx("borrowing_items").whereIn("book_id", ids).count("id as count").first();
      if (Number(activeItems?.count || 0) > 0) {
        return { error: "Buku yang memiliki riwayat peminjaman tidak dapat dihapus karena integritas data transaksi." };
      }

      const deleted = await trx("books").whereIn("id", ids).delete().returning("id");
      if (deleted.length > 0) {
        await trx("audit_logs").insert({
          user_id: user.id,
          action: "books.bulk_delete",
          entity_type: "books",
          entity_id: `${deleted.length}_books`,
          details: { count: deleted.length, requested: ids.length },
        });
      }
      return { success: true, count: deleted.length };
    });
  } catch (error) {
    if (error.name === "InputError") return { error: error.message };
    if (error.code === "23503") {
      return { error: "Buku yang dipilih terkait dengan data transaksi lain dan tidak dapat dihapus." };
    }
    throw error;
  }
}

export async function deleteCategoriesBulkAction(formData) {
  const user = await requireUser(["superadmin", "petugas"]);
  try {
    const ids = categoryBulkDeleteInput({
      confirmation: formData.get("confirmation"),
      ids: formData.getAll("ids"),
    });

    return await db.transaction(async (trx) => {
      const linkedBooks = await trx("books").whereIn("category_id", ids).count("id as count").first();
      if (Number(linkedBooks?.count || 0) > 0) {
        return { error: "Kategori yang masih memiliki koleksi buku tidak dapat dihapus. Pindahkan atau hapus buku terkait terlebih dahulu." };
      }

      const deleted = await trx("categories").whereIn("id", ids).delete().returning("id");
      if (deleted.length > 0) {
        await trx("audit_logs").insert({
          user_id: user.id,
          action: "categories.bulk_delete",
          entity_type: "categories",
          entity_id: `${deleted.length}_categories`,
          details: { count: deleted.length, requested: ids.length },
        });
      }
      return { success: true, count: deleted.length };
    });
  } catch (error) {
    if (error.name === "InputError") return { error: error.message };
    if (error.code === "23503") {
      return { error: "Kategori yang dipilih terkait dengan data lain dan tidak dapat dihapus." };
    }
    throw error;
  }
}

export async function deleteStudentsBulkAction(formData) {
  const user = await requireUser(["superadmin", "petugas"]);
  try {
    const ids = studentBulkDeleteInput({
      confirmation: formData.get("confirmation"),
      ids: formData.getAll("ids"),
    });

    return await db.transaction(async (trx) => {
      const activeBorrowings = await trx("borrowings")
        .whereIn("student_id", ids)
        .whereIn("status", ["borrowed", "overdue"])
        .count("id as count")
        .first();
      if (Number(activeBorrowings?.count || 0) > 0) {
        return { error: "Sebagian siswa yang dipilih masih memiliki peminjaman aktif atau terlambat dan tidak dapat dihapus." };
      }

      const anyBorrowings = await trx("borrowings").whereIn("student_id", ids).count("id as count").first();
      const anyFines = await trx("fines").whereIn("student_id", ids).count("id as count").first();
      if (Number(anyBorrowings?.count || 0) > 0 || Number(anyFines?.count || 0) > 0) {
        return { error: "Siswa yang memiliki riwayat peminjaman atau denda tidak dapat dihapus karena integritas data transaksi." };
      }

      const deleted = await trx("students").whereIn("id", ids).delete().returning("id");
      if (deleted.length > 0) {
        await trx("audit_logs").insert({
          user_id: user.id,
          action: "students.bulk_delete",
          entity_type: "students",
          entity_id: `${deleted.length}_students`,
          details: { count: deleted.length, requested: ids.length },
        });
      }
      return { success: true, count: deleted.length };
    });
  } catch (error) {
    if (error.name === "InputError") return { error: error.message };
    if (error.code === "23503") {
      return { error: "Siswa yang dipilih terkait dengan data transaksi lain dan tidak dapat dihapus." };
    }
    throw error;
  }
}
