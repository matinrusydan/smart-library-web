import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth";
import { createStudentImport } from "@/server/student-import";
import { parseStudentWorkbook, IMPORT_MAX_BYTES } from "@/server/student-import-parser";
import { InputError } from "@/server/validation";
import { importFailure } from "@/server/student-import-http";

export async function POST(request) {
  try {
    await requireUser(["superadmin", "petugas"]);
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function" || !file.name?.toLowerCase().endsWith(".xlsx")) throw new InputError("File XLSX wajib dipilih");
    if (file.size > IMPORT_MAX_BYTES) throw new InputError("File harus berukuran maksimal 2 MB");
    const parsed = await parseStudentWorkbook(Buffer.from(await file.arrayBuffer()));
    const validationErrors = parsed.filter(row => row.reason).map(({ rowNumber, reason }) => ({ row: rowNumber, message: `Baris ${rowNumber}: ${reason}` }));
    if (validationErrors.length) return NextResponse.json({ validationErrors, preview: [] });
    const job = await createStudentImport(parsed);
    const preview = parsed.slice(0, 20).map(({ student: s }) => ({ studentNumber: s.student_number, name: s.name, className: s.class_name, email: s.email, phone: s.phone }));
    return NextResponse.json({ job, preview, validationErrors: [] }, { status: 201 });
  } catch (error) { return importFailure(error); }
}
