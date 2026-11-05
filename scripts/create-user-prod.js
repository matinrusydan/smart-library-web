const path = require("node:path");
const fs = require("node:fs");
const { execSync } = require("node:child_process");
const knexFactory = require("knex");
const { hiddenQuestion, validatePassword } = require("./create-user");
const { assertPostgres16, assertAllowedDatabase } = require("../src/server/database/postgres-guard");

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return null;
}

async function main() {
  process.env.NODE_ENV = "production";
  process.env.SMART_LIBRARY_DATABASE_NAME = "neondb";

  let username = getArgValue("--username") || "admin";
  let name = getArgValue("--name") || "Superadmin Perpustakaan";

  const rawArgs = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  if (rawArgs.length >= 2) {
    username = rawArgs[0];
    name = rawArgs.slice(1).join(" ");
  }

  let connectionUrl = process.env.PROD_DATABASE_URL;
  if (!connectionUrl && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost") && !process.env.DATABASE_URL.includes("127.0.0.1") && process.env.DATABASE_URL.includes("neon")) {
    connectionUrl = process.env.DATABASE_URL;
  }

  let tempEnvFile = null;

  if (!connectionUrl) {
    process.stdout.write("Mengambil konfigurasi database production Vercel (Neon)...\n");
    tempEnvFile = path.resolve(process.cwd(), `.env.prod.tmp.${Date.now()}`);
    try {
      execSync(`vercel env pull "${tempEnvFile}" --yes --environment=production`, {
        stdio: ["ignore", "pipe", "pipe"],
      });
      if (fs.existsSync(tempEnvFile)) {
        const content = fs.readFileSync(tempEnvFile, "utf8");
        const match = content.match(/^DATABASE_URL=(.+)$/m);
        if (match) {
          connectionUrl = match[1].trim().replace(/^["']|["']$/g, "");
        }
      }
    } catch (err) {
      throw new Error(`Gagal mengambil konfigurasi dari Vercel CLI: ${err.message}. Pastikan sudah login di Vercel CLI.`);
    } finally {
      if (tempEnvFile && fs.existsSync(tempEnvFile)) {
        try { fs.unlinkSync(tempEnvFile); } catch {}
      }
    }
  }

  if (!connectionUrl) {
    throw new Error("DATABASE_URL produksi tidak ditemukan.");
  }

  const db = knexFactory({
    client: "pg",
    connection: connectionUrl,
    pool: { min: 1, max: 2 },
  });

  try {
    const { rows } = await db.raw(
      "SELECT current_setting('server_version_num') AS version_num, current_database() AS database_name"
    );
    assertPostgres16(rows[0]?.version_num);
    assertAllowedDatabase(rows[0]?.database_name, "neondb");

    const role = await db("roles").where({ name: "superadmin" }).first("id");
    if (!role) {
      throw new Error("Role 'superadmin' belum ada di database. Jalankan migrasi database terlebih dahulu.");
    }

    console.log(`\n========================================`);
    console.log(` Buat Akun Superadmin (Production Neon)`);
    console.log(`========================================`);
    console.log(`Target DB : neondb (Neon PostgreSQL)`);
    console.log(`Username  : ${username}`);
    console.log(`Nama      : ${name}\n`);

    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      throw new Error("Pembuatan akun memerlukan terminal interaktif untuk input password tersembunyi.");
    }

    const password = await hiddenQuestion("Password (min. 12 karakter): ");
    const confirmation = await hiddenQuestion("Konfirmasi password: ");
    validatePassword(password, confirmation);

    const argon2 = require("argon2");
    const hash = await argon2.hash(password);

    const existing = await db("users").where({ username }).first("id");
    if (existing) {
      await db("users").where({ id: existing.id }).update({
        role_id: role.id,
        name,
        password_hash: hash,
        updated_at: new Date(),
      });
      console.log(`\nPassword superadmin '${username}' berhasil diperbarui di database Neon.`);
    } else {
      await db("users").insert({
        role_id: role.id,
        username,
        name,
        password_hash: hash,
      });
      console.log(`\nSuperadmin '${username}' berhasil dibuat di database Neon.`);
    }

    console.log(`\nAnda sekarang dapat login di:`);
    console.log(`URL      : https://smart-library-web-ten.vercel.app/login`);
    console.log(`Username : ${username}`);
    console.log(`Password : (password yang baru saja Anda masukkan)\n`);
  } finally {
    await db.destroy();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`\nGagal membuat superadmin production: ${error.message}`);
    process.exitCode = 1;
  });
}
