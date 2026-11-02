const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("server validation constrains pagination and IDs", async () => {
  const { pagination, positiveId } = await import("../src/server/validation.js");
  assert.deepEqual(pagination({ page: "2", pageSize: "25" }), { page: 2, pageSize: 25, offset: 25 });
  for (const pageSize of [1, 15, 101, "25x"]) assert.throws(() => pagination({ pageSize }));
  assert.throws(() => pagination({ page: 0 }));
  assert.equal(positiveId("23"), "23");
  for (const id of ["0", "-1", "1;DROP", ""]) assert.throws(() => positiveId(id));
});

test("book, category and student validators enforce schema-compatible values", async () => {
  const { bookInput, categoryInput, studentInput } = await import("../src/server/validation.js");
  assert.equal(bookInput({ categoryId: "2", title: " T ", author: " A ", stockTotal: "4" }).stock_total, 4);
  assert.throws(() => bookInput({ categoryId: "2", title: "T", author: "A", stockTotal: "2", stockAvailable: "3" }));
  assert.equal(categoryInput({ name: "Cerita", isActive: "false" }).is_active, false);
  assert.throws(() => categoryInput({ name: "", isActive: "no" }));
  assert.equal(studentInput({ studentNumber: "S-1", name: "N", className: "6A", isActive: "true" }).class_name, "6A");
  assert.throws(() => studentInput({ studentNumber: "S-1", name: "N", email: "not-an-email" }));
});

test("catalog edits preserve borrowed copies and reject tampered availability", async () => {
  const { availableAfterStockEdit, bookInput } = await import("../src/server/validation.js");
  assert.equal(availableAfterStockEdit(10, 7, 12), 9);
  assert.equal(availableAfterStockEdit(10, 7, 3), 0);
  assert.throws(() => availableAfterStockEdit(10, 7, 2));
  assert.throws(() => availableAfterStockEdit(10, 11, 12));
  assert.throws(() => bookInput({ categoryId: "2", title: "T", author: "A", stockTotal: "4", stockAvailable: "4" }));
});

test("dashboard summary uses database counts and emits recent borrowing fields", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/server/queries.js"), "utf8");
  const dashboard = source.slice(source.indexOf("export async function getDashboardSummary"));
  for (const key of ["bookTitles", "activeStudents", "activeBorrowings", "overdueBorrowings", "lowStockBooks", "returnedBorrowings", "recentBorrowings"]) {
    assert.match(dashboard, new RegExp(`${key}\\s*:`));
  }
  assert.match(dashboard, /whereBetween\("stock_available", \[1, 2\]\)/, "low stock is 1-2 available copies (excluding out of stock)");
  assert.match(dashboard, /join\("students as st", "st\.id", "br\.student_id"\)/);
  assert.match(dashboard, /db\("borrowing_items as bi"\)/);
  assert.match(dashboard, /join\("books as b"/);
  assert.match(dashboard, /\.limit\(6\)/);
  assert.match(dashboard, /bookTitle: borrowing\.bookTitle \|\| ""/);
});

test("phase 2 migration adds category active status and opaque session storage", async () => {
  const migration = require("../database/migrations/202611020002_phase2_sessions_categories");
  const operations = [];
  const schema = {
    alterTable: async (name, callback) => { const table = { boolean: (...args) => ({ notNullable: () => ({ defaultTo: (value) => operations.push(["boolean", name, ...args, value]) }) }), dropColumn: (...args) => operations.push(["dropColumn", name, ...args]) }; callback(table); },
    createTable: async (name, callback) => { const table = { bigIncrements: (...args) => ({ primary: () => operations.push(["primary", ...args]) }), bigInteger: (...args) => ({ notNullable() { return this; }, references: () => ({ inTable: () => ({ onDelete: () => {} }) }) }), string: (...args) => ({ notNullable() { return this; }, unique: () => {} }), dateTime: (...args) => ({ notNullable() { return this; }, defaultTo: () => {} }), index: (...args) => operations.push(["index", ...args]) }; callback(table); },
    dropTableIfExists: async (name) => operations.push(["drop", name]),
  };
  const knex = { schema, fn: { now: () => "now" } };
  await migration.up(knex);
  assert(operations.some((op) => op[0] === "boolean" && op[1] === "categories" && op[2] === "is_active"));
  assert(operations.some((op) => op[0] === "index" && op[1][0] === "user_id"));
});
