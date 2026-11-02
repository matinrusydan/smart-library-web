import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { requireUser } from "@/server/auth";
import { IMPORT_BATCH_SIZE } from "@/server/student-import-parser";
import { InputError } from "@/server/validation";

const roles = ["superadmin", "petugas"];
function assertJobId(id) {
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new InputError("ID import tidak valid");
}
const aggregate = (job) => ({
  id: job.id,
  status: job.status.toUpperCase(),
  total: Number(job.total || 0),
  processed: Number(job.processed || 0),
  inserted: Number(job.inserted || 0),
  skipped: Number(job.skipped || 0),
  failed: Number(job.errors || 0),
});

export async function createStudentImport(rows) {
  const user = await requireUser(roles);
  const id = randomUUID();
  await db.transaction(async (trx) => {
    await trx("student_import_jobs").insert({ id, created_by: user.id, status: "draft", rows: JSON.stringify(rows.map(({ student }) => student)), total: rows.length });
    await audit(trx, user.id, id, "draft", rows.length);
  });
  return aggregate({ id, status: "draft", total: rows.length, processed: 0, inserted: 0, skipped: 0, errors: 0 });
}

export async function startStudentImport(id) {
  const job = await ownedJob(id);
  if (job.status === "draft") await db("student_import_jobs").where({ id, created_by: job.created_by, status: "draft" }).update({ status: "pending", updated_at: db.fn.now() });
  return getStudentImport(id);
}

export async function getStudentImport(id) { return aggregate(await ownedJob(id)); }

export async function retryStudentImport(id) {
  const job = await ownedJob(id);
  if (job.status === "failed") await db("student_import_jobs").where({ id, created_by: job.created_by, status: "failed" }).update({ status: "pending", last_error: null, updated_at: db.fn.now() });
  return getStudentImport(id);
}

export async function processStudentImport(id) {
  assertJobId(id);
  const user = await requireUser(roles);
  try {
    const result = await db.transaction(async (trx) => {
      const job = await trx("student_import_jobs").where({ id, created_by: user.id }).forUpdate().first();
      if (!job) throw new InputError("Importasi tidak ditemukan");
      if (job.status === "draft") throw new InputError("Importasi belum dimulai");
      if (["completed", "failed"].includes(job.status)) return aggregate(job);
      const rows = typeof job.rows === "string" ? JSON.parse(job.rows) : job.rows;
      const batch = rows.slice(job.processed, job.processed + IMPORT_BATCH_SIZE);
      let inserted = 0;
      for (const student of batch) {
        const created = await trx("students").insert(student).onConflict("student_number").ignore().returning("id");
        if (created.length) inserted++;
      }
      const processed = Number(job.processed) + batch.length;
      const skipped = Number(job.skipped) + batch.length - inserted;
      const status = processed === Number(job.total) ? "completed" : "pending";
      const updates = { processed, inserted: Number(job.inserted) + inserted, skipped, status, updated_at: trx.fn.now() };
      await trx("student_import_jobs").where({ id }).update(updates);
      await trx("audit_logs").insert({ user_id: user.id, action: "student_import.batch_processed", entity_type: "student_import", entity_id: id, details: { processed, inserted: updates.inserted, skipped, total: job.total } });
      return aggregate({ ...job, ...updates });
    });
    return result;
  } catch (error) {
    if (error instanceof InputError) throw error;
    // The transaction rolls back both inserts and cursor. Keep the job resumable;
    // a separate failure update could race a concurrent successful request.
    throw error;
  }
}

async function ownedJob(id) {
  assertJobId(id);
  const user = await requireUser(roles);
  const job = await db("student_import_jobs").where({ id, created_by: user.id }).first();
  if (!job) throw new InputError("Importasi tidak ditemukan");
  return job;
}

async function audit(trx, userId, id, status, total) {
  await trx("audit_logs").insert({ user_id: userId, action: "student_import.created", entity_type: "student_import", entity_id: id, details: { status, total } });
}
