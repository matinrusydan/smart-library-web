import test from "node:test";
import assert from "node:assert/strict";
import { accountActiveState, accountId, accountName, accountPassword, accountUsername, assertCanDeactivate, AccountInputError } from "../src/server/admin-account-validation.js";

test("account names and usernames are trimmed and constrained", () => {
  assert.equal(accountName("  Alex Doe "), "Alex Doe");
  assert.equal(accountUsername(" clerk_1 "), "clerk_1");
  for (const invalid of [" ", "x", "a".repeat(161), "a\nb"]) assert.throws(() => accountName(invalid), AccountInputError);
  for (const invalid of ["ab", "space name", "bad/name", "a".repeat(65)]) assert.throws(() => accountUsername(invalid), AccountInputError);
});

test("password policy requires length and mixed character classes", () => {
  assert.equal(accountPassword("GoodPassword123"), "GoodPassword123");
  for (const invalid of ["short1Aa", "alllowercase123", "ALLUPPERCASE123", "NoDigitsPassword"]) assert.throws(() => accountPassword(invalid), AccountInputError);
});

test("account activation input rejects missing and ambiguous values", () => {
  assert.equal(accountActiveState("true"), true);
  assert.equal(accountActiveState("false"), false);
  for (const invalid of [null, undefined, true, false, "", "TRUE", "0", " true "]) {
    assert.throws(() => accountActiveState(invalid), AccountInputError);
  }
});

test("account IDs use the positive numeric ID policy", () => {
  assert.equal(accountId("42"), "42");
  for (const invalid of [0, -1, "01", "1x", null, "9".repeat(19)]) assert.throws(() => accountId(invalid), AccountInputError);
});

test("deactivation policy prevents self-deactivation and removing the last active superadmin", () => {
  assert.throws(() => assertCanDeactivate({ id: "2", role: "petugas", is_active: true }, 2, 1), /sendiri/);
  assert.throws(() => assertCanDeactivate({ id: "3", role: "superadmin", is_active: true }, 2, 1), /terakhir/);
  assert.doesNotThrow(() => assertCanDeactivate({ id: "3", role: "superadmin", is_active: true }, 2, 2));
  assert.throws(() => assertCanDeactivate({ id: "3", role: "superadmin", is_active: true }, 2, "1"), /terakhir/);
  assert.doesNotThrow(() => assertCanDeactivate({ id: "3", role: "petugas", is_active: true }, 2, 0));
});
