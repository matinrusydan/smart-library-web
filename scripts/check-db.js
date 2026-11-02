const path = require("node:path");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.resolve(__dirname, "..", ".env.local"), quiet: true });
}
const knex = require("knex");
const { assertPostgres16, assertAllowedDatabase } = require("../src/server/database/postgres-guard");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum diatur di environment (atau .env.local untuk development)");
  const db = knex({ client: "pg", connection: process.env.DATABASE_URL });
  try {
    const result = await db.raw("SELECT current_setting('server_version_num') AS version_num, current_database() AS database_name");
    const { version_num: version, database_name: name } = result.rows[0];
    assertPostgres16(version);
    assertAllowedDatabase(name);
    console.log(`OK: PostgreSQL 16 terhubung ke database ${name}`);
  } finally {
    await db.destroy();
  }
}

main().catch((error) => { console.error(`Koneksi database gagal: ${error.message}`); process.exitCode = 1; });
