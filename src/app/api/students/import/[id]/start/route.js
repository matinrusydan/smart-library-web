import { NextResponse } from "next/server";
import { startStudentImport } from "@/server/student-import";
import { importFailure } from "@/server/student-import-http";
export async function POST(_request, { params }) { try { return NextResponse.json({ job: await startStudentImport((await params).id) }); } catch (error) { return importFailure(error); } }
