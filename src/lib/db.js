import knex from "knex";

import "server-only";
import { assertAllowedDatabase, assertPostgres16 } from "@/server/database/postgres-guard";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL belum diatur di .env.local");

export const db = knex({
  client: "pg",
  connection: databaseUrl,
  pool: {
    min: 0,
    max: 10,
    afterCreate(connection, done) {
      connection.query("SELECT current_setting('server_version_num') AS version_num, current_database() AS database_name", (error, result) => {
        if (error) return done(error, connection);
        try {
          assertPostgres16(result.rows[0]?.version_num);
          assertAllowedDatabase(result.rows[0]?.database_name);
          done(null, connection);
        } catch (guardError) {
          done(guardError, connection);
        }
      });
    },
  },
});

export async function pingDatabase() {
  const result = await db.raw("SELECT 1 AS ok");
  return Boolean(result?.rows?.[0]?.ok);
}
