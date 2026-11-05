import knex from "knex";

import "server-only";
import { assertAllowedDatabase, assertPostgres16 } from "@/server/database/postgres-guard";

function createDbInstance() {
  const databaseUrl = process.env.DATABASE_URL;
  return knex({
    client: "pg",
    connection: databaseUrl,
    pool: {
      min: 0,
      max: Number(process.env.DB_POOL_MAX) || 5,
      idleTimeoutMillis: 10000,
      acquireTimeoutMillis: 15000,
      afterCreate(connection, done) {
        if (!process.env.DATABASE_URL) {
          return done(new Error("DATABASE_URL belum diatur di environment"), connection);
        }
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
}

const globalForDb = globalThis;
export const db = globalForDb.__smartLibraryDb || createDbInstance();
globalForDb.__smartLibraryDb = db;

export async function pingDatabase() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum diatur di environment");
  const result = await db.raw("SELECT 1 AS ok");
  return Boolean(result?.rows?.[0]?.ok);
}
