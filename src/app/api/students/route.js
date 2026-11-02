import { NextResponse } from "next/server";
import { listStudents } from "@/server/queries";
export async function GET(request){try{const search=Object.fromEntries(new URL(request.url).searchParams);return NextResponse.json(await listStudents(search))}catch(error){const denied=["UNAUTHENTICATED","FORBIDDEN"].includes(error?.message);return NextResponse.json({error:denied?"Tidak diizinkan":"Tidak dapat memuat siswa"},{status:denied?401:500})}}
