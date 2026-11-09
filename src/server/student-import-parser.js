import ExcelJS from "exceljs";
import JSZip from "jszip";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { InputError, studentInput } from "./validation.js";

const SPREADSHEETML_NAMESPACE = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";

export const IMPORT_MAX_BYTES = 2 * 1024 * 1024;
export const IMPORT_MAX_ROWS = 5000;
export const IMPORT_BATCH_SIZE = 100;
export const IMPORT_HEADERS = ["NIS", "Nama", "Kelas", "Email", "Telepon"];

export function normalizeImportRows(rawRows) {
  if (rawRows.length < 1 || rawRows.length > IMPORT_MAX_ROWS) throw new InputError("Jumlah baris harus antara 1 dan 5000");
  const seen = new Set();
  return rawRows.map(({ rowNumber, values }) => {
    try {
      // NIS must be entered as text in Excel; numeric cell formatting may already have lost leading zeroes.
      const nis = typeof values[0] === "string" ? values[0] : (values[0] == null ? "" : String(values[0]));
      const row = studentInput({ studentNumber: nis, name: cellText(values[1]), className: cellText(values[2]), email: cellText(values[3]), phone: cellText(values[4]) });
      if (seen.has(row.student_number)) throw new InputError("NIS duplikat dalam file");
      seen.add(row.student_number);
      return { rowNumber, student: row };
    } catch (error) { return { rowNumber, reason: error.message || "Baris tidak valid" }; }
  });
}

function cellText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "text" in value) return String(value.text ?? "");
  if (typeof value === "object" && "result" in value) return cellText(value.result);
  return String(value);
}

async function normalizeSpreadsheetXmlNamespaces(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const parser = new DOMParser({
    onError: (level, message) => {
      if (level !== "warning") throw new InputError("XML workbook tidak valid");
    },
  });
  const serializer = new XMLSerializer();

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir || !path.endsWith(".xml")) continue;
    const xml = (await entry.async("string")).replace(/^\uFEFF/, "");
    const document = parser.parseFromString(xml, "application/xml");
    const elements = [];
    const visit = (node) => {
      if (node.nodeType === 1) {
        elements.push(node);
        for (let child = node.firstChild; child; child = child.nextSibling) visit(child);
      }
    };
    visit(document.documentElement);
    for (const element of elements) {
      if (element.namespaceURI !== SPREADSHEETML_NAMESPACE || !element.prefix) continue;
      const replacement = document.createElementNS(SPREADSHEETML_NAMESPACE, element.localName);
      for (let i = 0; i < element.attributes.length; i++) {
        const attribute = element.attributes.item(i);
        if (attribute.name === `xmlns:${element.prefix}`) continue;
        replacement.setAttributeNS(attribute.namespaceURI, attribute.name, attribute.value);
      }
      while (element.firstChild) replacement.appendChild(element.firstChild);
      element.parentNode.replaceChild(replacement, element);
    }
    zip.file(path, serializer.serializeToString(document));
  }

  return zip.generateAsync({ type: "nodebuffer" });
}

export async function parseStudentWorkbook(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length > IMPORT_MAX_BYTES) throw new InputError("File harus berukuran maksimal 2 MB");
  const workbook = new ExcelJS.Workbook();
  try {
    const normalized = await normalizeSpreadsheetXmlNamespaces(buffer);
    await workbook.xlsx.load(normalized);
  } catch {
    throw new InputError("File XLSX tidak valid atau tidak didukung");
  }
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new InputError("Workbook tidak memiliki worksheet");
  const headers = IMPORT_HEADERS.map((_, i) => cellText(sheet.getRow(1).getCell(i + 1).value).trim());
  if (headers.some((header, i) => header !== IMPORT_HEADERS[i]) || sheet.getRow(1).cellCount > IMPORT_HEADERS.length) throw new InputError(`Header harus tepat: ${IMPORT_HEADERS.join(", ")}`);
  const raw = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = IMPORT_HEADERS.map((_, i) => row.getCell(i + 1).value);
    if (values.every(value => value == null || String(value).trim() === "")) return;
    if (raw.length >= IMPORT_MAX_ROWS) throw new InputError("Maksimal 5000 baris data");
    raw.push({ rowNumber, values });
  });
  return normalizeImportRows(raw);
}

export async function createStudentImportTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Siswa");

  // Columns with explicit widths
  sheet.columns = [
    { key: "nis", header: "NIS", width: 16 },
    { key: "nama", header: "Nama", width: 32 },
    { key: "kelas", header: "Kelas", width: 18 },
    { key: "email", header: "Email", width: 30 },
    { key: "telepon", header: "Telepon", width: 20 },
  ];

  // Header row styling (adapted from tokens / e-raport-v4 pattern)
  const headerRow = sheet.getRow(1);
  headerRow.height = 24;
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11, name: "Calibri" };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF163A46" }, // primary brand token
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  // Example row (data row)
  const sample = sheet.addRow({
    nis: "00123",
    nama: "Nama Siswa Contoh",
    kelas: "VII A",
    email: "siswa@example.com",
    telepon: "08123456789",
  });
  sample.height = 20;

  // Add borders and alignments to both header and sample rows
  const borderStyle = { style: "thin", color: { argb: "FFD3DFE2" } };
  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.border = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };
      if (rowNumber > 1) {
        cell.alignment = { vertical: "middle", horizontal: colNumber === 1 ? "center" : "left" };
        cell.font = { size: 10, name: "Calibri" };
      }
    });
  });

  // Freeze the top row so header stays visible when scrolling
  sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1, activeCell: "A2" }];

  // Force NIS column to Text format so leading zeroes don't strip
  sheet.getColumn(1).numFmt = "@";

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
