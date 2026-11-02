import { NextResponse } from "next/server";
import { InputError } from "@/server/validation";

export async function listResponse(request, list) {
  try {
    const args = Object.fromEntries(new URL(request.url).searchParams.entries());
    const result = await list(args);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error.message === "UNAUTHENTICATED") return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    if (error instanceof InputError || error.message === "INVALID_FILTER") return NextResponse.json({ error: "Filter tidak valid" }, { status: 400 });
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}
