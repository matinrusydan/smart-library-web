import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth";
import { createStudentImportTemplate } from "@/server/student-import-parser";
import { importFailure } from "@/server/student-import-http";
export async function GET() { try { await requireUser(["superadmin", "petugas"]); const file = await createStudentImportTemplate(); return new NextResponse(file, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": 'attachment; filename="template-import-siswa.xlsx"' } }); } catch (error) { return importFailure(error); } }
