const test = require("node:test");
const assert = require("node:assert/strict");

test("calendar validation and Jakarta today use explicit calendar dates", async () => {
  const { calendarDate, jakartaToday, addCalendarDays } = await import("../src/server/validation-circulation.js");
  assert.equal(jakartaToday(new Date("2026-11-01T18:00:00Z")), "2026-11-02");
  assert.equal(addCalendarDays("2026-12-28", 7), "2027-01-04");
  assert.equal(calendarDate("2024-02-29"), "2024-02-29");
  for (const value of ["2025-02-29", "2026-2-01", "2026-13-01", "01/01/2026"]) assert.throws(() => calendarDate(value));
});

test("borrowing validation enforces unique IDs, positive quantity and seven-day default", async () => {
  const { borrowingInput, paymentInput } = await import("../src/server/validation-circulation.js");
  assert.deepEqual(borrowingInput({ studentId: "2", borrowedAt: "2026-11-02", items: [{ bookId: "9", quantity: "2" }, { bookId: "3", quantity: 1 }] }), {
    studentId: "2", borrowedAt: "2026-11-02", dueAt: "2026-11-09", items: [{ bookId: "3", quantity: 1 }, { bookId: "9", quantity: 2 }],
  });
  assert.equal(borrowingInput({ studentId: "2", items: [{ bookId: "1", quantity: 1 }] }).dueAt, "2026-11-09");
  assert.throws(() => borrowingInput({ studentId: "2", items: [{ bookId: "1", quantity: 1 }, { bookId: "1", quantity: 2 }] }));
  assert.throws(() => borrowingInput({ studentId: "2", items: [{ bookId: "1", quantity: 0 }] }));
  assert.throws(() => borrowingInput({ studentId: "2", items: [] }));
  assert.deepEqual(paymentInput({ fineId: "5", amount: "2000", method: " cash ", reference: " R1 " }), {
    fineId: "5", amount: 2000, method: "cash", reference: "R1",
  });
  for (const amount of [true, false, "1.5", "-2", "", "1x", 0]) assert.throws(() => paymentInput({ fineId: "5", amount }));
  assert.throws(() => paymentInput({ fineId: "5", amount: 20, method: "m".repeat(31) }));
  assert.throws(() => paymentInput({ fineId: "5", amount: 20, reference: "r".repeat(121) }));
  assert.throws(() => paymentInput({ fineId: "5", amount: 20, method: 1 }));
});

test("late fine is per borrowing transaction per late calendar day", async () => {
  const { lateFine } = await import("../src/server/validation-circulation.js");
  assert.equal(lateFine("2026-11-09", "2026-11-09"), 0);
  assert.equal(lateFine("2026-11-09", "2026-11-12"), 3000);
  assert.equal(lateFine("2026-12-31", "2027-01-02"), 2000);
});
