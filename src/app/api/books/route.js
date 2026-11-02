import { NextResponse } from "next/server";
import { listBooks } from "@/server/queries";
export async function GET(request){try{const search=Object.fromEntries(new URL(request.url).searchParams);return NextResponse.json(await listBooks(search))}catch(error){const denied=["UNAUTHENTICATED","FORBIDDEN"].includes(error?.message);return NextResponse.json({error:denied?"Tidak diizinkan":"Tidak dapat memuat daftar buku"},{status:denied?401:500})}}
