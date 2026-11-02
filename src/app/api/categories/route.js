import { NextResponse } from "next/server";
import { listCategories } from "@/server/queries";
export async function GET(request){try{const search=Object.fromEntries(new URL(request.url).searchParams);return NextResponse.json(await listCategories(search))}catch(error){const denied=["UNAUTHENTICATED","FORBIDDEN"].includes(error?.message);return NextResponse.json({error:denied?"Tidak diizinkan":"Tidak dapat memuat kategori"},{status:denied?401:500})}}
