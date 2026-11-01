import knex from "knex";

import "server-only";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL belum diatur di .env.local");

export const db = knex({
  client: "pg",
  connection: databaseUrl,
  pool: { min: 2, max: 10 },
});

export async function pingDatabase() {
  const result = await db.raw("SELECT 1 AS ok");
  return Boolean(result?.rows?.[0]?.ok);
}
