import { NextResponse } from "next/server";
import { InputError } from "@/server/validation";

export function importFailure(error) {
  if (error?.message === "UNAUTHENTICATED") return NextResponse.json({ error: "Silakan masuk terlebih dahulu" }, { status: 401 });
  if (error?.message === "FORBIDDEN") return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  if (error instanceof InputError) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ error: "Proses import gagal. Silakan coba lagi." }, { status: 500 });
}
