import test from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { IMPORT_BATCH_SIZE, IMPORT_HEADERS, createStudentImportTemplate, normalizeImportRows, parseStudentWorkbook } from "../src/server/student-import-parser.js";
import { InputError } from "../src/server/validation.js";

test("planner validates rows, preserves NIS leading zeroes and reports file duplicates", () => {
  const result = normalizeImportRows([
    { rowNumber: 2, values: ["00123", "Ani", "VII A", "", ""] },
    { rowNumber: 3, values: ["00123", "Budi", "VII A", "", ""] },
    { rowNumber: 4, values: ["4", "Bad", "", "invalid", ""] },
  ]);
  assert.equal(result[0].student.student_number, "00123");
  assert.match(result[1].reason, /duplikat/i);
  assert.equal(result[2].reason, "Email tidak valid");
});

test("parser round-trips workbook and enforces required exact column headers", async () => {
  const buffer = await createStudentImportTemplate();
  const rows = await parseStudentWorkbook(buffer);
  assert.equal(rows[0].student.student_number, "00123");
  assert.equal(IMPORT_HEADERS.join(","), "NIS,Nama,Kelas,Email,Telepon");
  const styled = await import("exceljs").then(({ default: ExcelJS }) => new ExcelJS.Workbook());
  await styled.xlsx.load(buffer);
  const template = styled.getWorksheet("Siswa");
  assert.equal(template.getRow(1).font.bold, true);
  assert.equal(template.getRow(1).font.color.argb, "FFFFFFFF");
  assert.equal(template.getRow(1).fill.fgColor.argb, "FF163A46");
  assert.equal(template.getRow(1).alignment.horizontal, "center");
  assert.equal(template.getCell("A2").value, "00123");
  assert.equal(template.getColumn(1).numFmt, "@");
  assert.equal(template.views[0].ySplit, 1);
  const workbook = await import("exceljs").then(({ default: ExcelJS }) => new ExcelJS.Workbook());
  workbook.addWorksheet("invalid").addRow(["nis", ...IMPORT_HEADERS.slice(1)]);
  await assert.rejects(parseStudentWorkbook(Buffer.from(await workbook.xlsx.writeBuffer())), InputError);
});

test("batch size is bounded and row count is capped", () => {
  assert.equal(IMPORT_BATCH_SIZE, 100);
  assert.throws(() => normalizeImportRows(Array.from({ length: 5001 }, (_, i) => ({ rowNumber: i + 2, values: [String(i), "Name", "", "", ""] }))), InputError);
});

test("parser supports externally generated SpreadsheetML with prefixed XML namespaces and BOM", async () => {
  const template = await createStudentImportTemplate();
  const zip = await JSZip.loadAsync(template);
  const path = "xl/workbook.xml";
  const xml = await zip.file(path).async("string");
  const modified = `\uFEFF${xml.replace("<workbook", '<x:workbook xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main"').replace("</workbook>", "</x:workbook>")}`;
  zip.file(path, modified);
  const parsed = await parseStudentWorkbook(await zip.generateAsync({ type: "nodebuffer" }));
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].student.student_number, "00123");
});
