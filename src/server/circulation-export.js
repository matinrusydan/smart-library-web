import "server-only";
import ExcelJS from "exceljs";
import { listCirculation } from "@/server/circulation-queries";

const PAGE_SIZE = 100;
const MAX_ROWS = 10_000;

export class CirculationExportLimitError extends Error {
  constructor() {
    super("Jumlah data melebihi batas ekspor 10.000 baris");
    this.name = "CirculationExportLimitError";
  }
}

const value = (input) => {
  const text = input == null ? "" : String(input);
  // Prevent spreadsheet applications interpreting user-controlled text as a formula.
  return /^[\t\r\n ]*[=+@-]/.test(text) ? `'${text}` : text;
};

export async function createCirculationExport(args = {}) {
  if (args.kind !== "borrowing-report" && args.kind !== "return-report") {
    // Delegate validation and authentication to the same service as the listing API.
    await listCirculation({ ...args, page: 1, pageSize: PAGE_SIZE });
    throw new Error("INVALID_FILTER");
  }

  const rows = [];
  let total = null;
  for (let page = 1; ; page += 1) {
    const result = await listCirculation({ ...args, page, pageSize: PAGE_SIZE });
    total ??= result.total;
    if (total > MAX_ROWS) throw new CirculationExportLimitError();
    rows.push(...result.items);
    if (rows.length >= total || result.items.length === 0) break;
    if (rows.length >= MAX_ROWS) throw new CirculationExportLimitError();
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Smart Library";
  const worksheet = workbook.addWorksheet(args.kind === "return-report" ? "Laporan Pengembalian" : "Laporan Peminjaman");
  const isReturn = args.kind === "return-report";
  const headers = [
    "ID Transaksi", "ID Siswa", "Nama Siswa", "NIS", "Kelas",
    "Tanggal Peminjaman", "Jatuh Tempo", "Tanggal Pengembalian", "Status",
    "ID Buku", "Judul Buku", "Jumlah",
    ...(isReturn ? ["Hari Terlambat", "Denda (Rp)"] : []),
  ];
  worksheet.addRow(headers);
  for (const item of rows) {
    const books = item.items?.length ? item.items : [null];
    for (const book of books) {
      worksheet.addRow([
        value(item.id), value(item.studentId), value(item.studentName), value(item.studentNumber), value(item.className),
        value(item.borrowedAt), value(item.dueAt), value(item.returnedAt), value(item.status),
        value(book?.bookId), value(book?.title), book ? Number(book.quantity) : "",
        ...(isReturn ? [Number(item.overdueDays || 0), Number(item.overdueDays || 0) * 1000] : []),
      ]);
    }
  }
  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.columns.forEach((column) => { column.width = Math.min(36, Math.max(14, ...worksheet.getColumn(column.number).values.slice(1).map((cell) => String(cell ?? "").length + 2))); });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
