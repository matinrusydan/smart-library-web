import { NextResponse } from "next/server";
import { InputError } from "@/server/validation";
import { CirculationExportLimitError, createCirculationExport } from "@/server/circulation-export";

const MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function GET(request) {
  try {
    const args = Object.fromEntries(new URL(request.url).searchParams.entries());
    const data = await createCirculationExport(args);
    const report = args.kind === "return-report" ? "pengembalian" : "peminjaman";
    const filename = `laporan-${report}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return new NextResponse(data, {
      headers: {
        "Content-Type": MIME,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error.message === "UNAUTHENTICATED") return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    if (error instanceof InputError || error.message === "INVALID_FILTER") return NextResponse.json({ error: "Filter tidak valid" }, { status: 400 });
    if (error instanceof CirculationExportLimitError) return NextResponse.json({ error: error.message }, { status: 413 });
    return NextResponse.json({ error: "Gagal mengekspor data" }, { status: 500 });
  }
}
