const path = require("node:path");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local"), quiet: true });
}
const knexFactory = require("knex");

function parseArgs(args) {
  const values = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!["--role", "--username", "--name"].includes(key) || !args[i + 1] || args[i + 1].startsWith("--") || values[key]) throw new Error("Gunakan --role superadmin --username <username> --name <nama>");
    values[key] = args[i + 1];
  }
  if (values["--role"] !== "superadmin") throw new Error("CLI hanya menerima --role superadmin");
  const username = values["--username"], name = values["--name"];
  if (!username || !/^[a-zA-Z0-9._-]{3,64}$/.test(username)) throw new Error("Username harus 3-64 karakter: huruf, angka, titik, garis bawah, atau strip");
  if (!name || name.trim().length < 2 || name.trim().length > 160 || /[\u0000-\u001f]/.test(name)) throw new Error("Nama harus 2-160 karakter");
  return { username, name: name.trim() };
}

function hiddenQuestion(prompt, { input = process.stdin, output = process.stdout } = {}) {
  if (!input.isTTY || typeof input.setRawMode !== "function") {
    return Promise.reject(new Error("Input password tersembunyi memerlukan terminal interaktif"));
  }

  return new Promise((resolve, reject) => {
    const wasRaw = Boolean(input.isRaw);
    let answer = "";
    let settled = false;

    const cleanup = () => {
      input.removeListener("data", onData);
      input.removeListener("end", onClosed);
      input.removeListener("close", onClosed);
      if (!wasRaw) {
        try { input.setRawMode(false); } catch { /* terminal may already be closed */ }
      }
      try { input.pause?.(); } catch { /* terminal may already be closed */ }
    };
    const finish = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      output.write("\n");
      if (error) reject(error);
      else resolve(answer);
    };
    const onClosed = () => finish(new Error("Terminal ditutup"));
    const onData = (chunk) => {
      for (const char of String(chunk)) {
        if (char === "\u0003") return finish(new Error("Dibatalkan"));
        if (char === "\r" || char === "\n") return finish();
        if (char === "\u0004") return finish(new Error("Terminal ditutup"));
        if (char === "\u007f" || char === "\b") answer = answer.slice(0, -1);
        else if (char >= " " && char !== "\u007f") answer += char;
      }
    };

    try {
      input.setRawMode(true);
      input.resume?.();
      input.on("data", onData);
      input.once("end", onClosed);
      input.once("close", onClosed);
      output.write(prompt);
    } catch (error) {
      try { cleanup(); } catch { /* preserve the original setup error */ }
      reject(error);
    }
  });
}

function validatePassword(password, confirmation) {
  if (password !== confirmation) throw new Error("Konfirmasi password tidak cocok");
  if (password.length < 12 || password.length > 128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error("Password wajib 12-128 karakter dan mengandung huruf kecil, huruf besar, serta angka");
  }
}

async function main() {
  const { username, name } = parseArgs(process.argv.slice(2));
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("Pembuatan akun memerlukan terminal interaktif untuk input password tersembunyi");
  const password = await hiddenQuestion("Password (min. 12 karakter): ");
  const confirmation = await hiddenQuestion("Konfirmasi password: ");
  validatePassword(password, confirmation);
  let argon2;
  try { argon2 = require("argon2"); } catch { throw new Error("Dependency hashing wajib: instal argon2 (npm install argon2) sebelum membuat user"); }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum diatur di .env.local");
  const db = knexFactory({ client: "pg", connection: process.env.DATABASE_URL });
  try {
    const { rows } = await db.raw("SELECT current_setting('server_version_num') AS version_num, current_database() AS database_name");
    require("../src/server/database/postgres-guard").assertPostgres16(rows[0]?.version_num);
    require("../src/server/database/postgres-guard").assertAllowedDatabase(rows[0]?.database_name);
    const role = await db("roles").where({ name: "superadmin" }).first("id");
    if (!role) throw new Error("Role belum ada; jalankan migrasi dan seed dahulu");
    const hash = await argon2.hash(password);
    await db("users").insert({ role_id: role.id, username, name, password_hash: hash });
    console.log(`Superadmin '${username}' berhasil dibuat.`);
  } catch (error) {
    if (error.code === "23505") throw new Error("Username sudah digunakan");
    throw error;
  } finally { await db.destroy(); }
}

module.exports = { parseArgs, validatePassword, hiddenQuestion };
if (require.main === module) main().catch((error) => { console.error(`Gagal membuat user: ${error.message}`); process.exitCode = 1; });
