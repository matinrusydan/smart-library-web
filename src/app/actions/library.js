"use server";
import { db } from "@/lib/db";
import { requireUser } from "@/server/auth";
import { availableAfterStockEdit, bookInput, categoryInput, formObject, positiveId, studentInput } from "@/server/validation";

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
