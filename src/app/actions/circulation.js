"use server";
import { requireUser } from "@/server/auth";
import { borrowBooks, payFine, returnBorrowing } from "@/server/circulation";
import { InputError } from "@/server/validation";

async function run(operation) {
  try { return await operation(); }
  catch (error) { if (error instanceof InputError) return { error: error.message }; throw error; }
}

export async function borrowBooksAction(formData) {
  return run(async () => {
    await requireUser(["superadmin", "petugas"]);
    let items;
    try { items = JSON.parse(String(formData.get("items") || "")); } catch { throw new InputError("Daftar buku tidak valid"); }
    return borrowBooks({ studentId: formData.get("studentId"), borrowedAt: formData.get("borrowedAt") || undefined, items });
  });
}

export async function returnBorrowingAction(formData) {
  return run(async () => {
    await requireUser(["superadmin", "petugas"]);
    return returnBorrowing(formData.get("borrowingId"), formData.get("returnedAt") || undefined);
  });
}

export async function payFineAction(formData) {
  return run(async () => {
    await requireUser(["superadmin", "petugas"]);
    return payFine({ fineId: formData.get("fineId"), amount: formData.get("amount"), method: formData.get("method"), reference: formData.get("reference") });
  });
}
