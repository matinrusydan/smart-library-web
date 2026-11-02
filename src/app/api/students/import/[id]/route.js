import { NextResponse } from "next/server";
import { getStudentImport } from "@/server/student-import";
import { importFailure } from "@/server/student-import-http";

export async function GET(_request, { params }) { try { return NextResponse.json({ job: await getStudentImport((await params).id) }); } catch (error) { return importFailure(error); } }
