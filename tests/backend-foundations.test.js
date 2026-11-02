const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { assertPostgres16, assertAllowedDatabase } = require("../src/server/database/postgres-guard");
const { parseArgs, validatePassword, hiddenQuestion } = require("../scripts/create-user");

test("Knex production config uses external credentials and omits seeds", () => {
  const previousUrl = process.env.DATABASE_URL;
  const previousEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  process.env.DATABASE_URL = "postgres://deployment-env.invalid/smart_library";
  try {
    delete require.cache[require.resolve("../knexfile")];
    const config = require("../knexfile");
    assert.equal(config.production.client, "pg");
    assert.equal(config.production.connection, process.env.DATABASE_URL);
    assert.equal(config.production.migrations.directory.endsWith("database\\migrations"), true);
    assert.equal(Object.hasOwn(config.production, "seeds"), false);
    assert.equal(config.development.seeds.directory.endsWith("database\\seeds"), true);
  } finally {
    delete require.cache[require.resolve("../knexfile")];
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
    if (previousEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousEnvironment;
  }
});

function mockTerminal() {
  const input = new EventEmitter();
  input.isTTY = true;
  input.isRaw = false;
  input.setRawMode = (raw) => { input.isRaw = raw; };
  input.resume = () => {};
  input.pause = () => {};
  let outputText = "";
  return { input, output: { write: (text) => { outputText += text; } }, getOutput: () => outputText };
}

test("PostgreSQL guard accepts only major version 16", () => {
  assert.doesNotThrow(() => assertPostgres16("160003"));
  for (const version of ["150010", "170000", "bad", undefined]) assert.throws(() => assertPostgres16(version), /Perlu PostgreSQL 16/);
});

test("database guard blocks databases outside the explicit project allowance", () => {
  assert.doesNotThrow(() => assertAllowedDatabase("smart_library", "smart_library"));
  assert.throws(() => assertAllowedDatabase("postgres", "smart_library"), /dibatasi/);
  assert.throws(() => assertAllowedDatabase(undefined, "smart_library"), /dibatasi/);
});

test("user CLI accepts only valid superadmin arguments", () => {
  assert.deepEqual(parseArgs(["--role", "superadmin", "--username", "admin.one", "--name", "Admin Satu"]), { username: "admin.one", name: "Admin Satu" });
  assert.throws(() => parseArgs(["--role", "petugas", "--username", "admin", "--name", "Admin"]), /hanya menerima/);
  assert.throws(() => parseArgs(["--role", "superadmin", "--username", "x", "--name", "Admin"]), /Username/);
  assert.throws(() => parseArgs(["--role", "superadmin", "--username", "admin", "--name", "A"]), /Nama/);
  assert.throws(() => parseArgs(["--role", "superadmin", "--username", "admin", "--username", "other", "--name", "Admin"]), /Gunakan/);
});

test("user CLI requires a matching strong password without exposing it in arguments", () => {
  assert.doesNotThrow(() => validatePassword("StrongPassword123", "StrongPassword123"));
  assert.throws(() => validatePassword("StrongPassword123", "OtherPassword123"), /tidak cocok/);
  assert.throws(() => validatePassword("short", "short"), /12-128/);
  assert.throws(() => validatePassword("lowercasepassword", "lowercasepassword"), /huruf kecil/);
});

test("hidden password prompts are visible while input remains un-echoed", async () => {
  const terminal = mockTerminal();
  const result = hiddenQuestion("Password (min. 12 karakter): ", terminal);
  assert.equal(terminal.getOutput(), "Password (min. 12 karakter): ");
  terminal.input.emit("data", "SecretPassword123\r");
  assert.equal(await result, "SecretPassword123");
  assert.equal(terminal.getOutput(), "Password (min. 12 karakter): \n");
  assert.equal(terminal.getOutput().includes("SecretPassword123"), false);
  assert.equal(terminal.input.isRaw, false);
});

test("hidden password prompt supports confirmation label, editing, Ctrl+C, and terminal close", async () => {
  const terminal = mockTerminal();
  const confirmation = hiddenQuestion("Konfirmasi password: ", terminal);
  terminal.input.emit("data", "wrongx\u007fStrongPassword123\n");
  assert.equal(await confirmation, "wrongStrongPassword123");
  assert.match(terminal.getOutput(), /^Konfirmasi password: /);
  assert.equal(terminal.getOutput().includes("StrongPassword123"), false);

  const cancelledTerminal = mockTerminal();
  const cancelled = hiddenQuestion("Password: ", cancelledTerminal);
  cancelledTerminal.input.emit("data", "private\u0003");
  await assert.rejects(cancelled, /Dibatalkan/);
  assert.equal(cancelledTerminal.getOutput().includes("private"), false);
  assert.equal(cancelledTerminal.input.isRaw, false);

  const closedTerminal = mockTerminal();
  const closed = hiddenQuestion("Password: ", closedTerminal);
  closedTerminal.input.emit("close");
  await assert.rejects(closed, /Terminal ditutup/);
  assert.equal(closedTerminal.input.isRaw, false);
});
