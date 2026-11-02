const path = require("node:path");
const { assertPostgres16 } = require("./src/server/database/postgres-guard");

// Resolve local development configuration from the repository, not the caller's cwd.
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.resolve(__dirname, ".env.local") });
}

function guardedConnection() {
  return {
    afterCreate(connection, done) {
      connection.query("SELECT current_setting('server_version_num') AS version_num, current_database() AS database_name", (error, result) => {
        if (error) return done(error, connection);
        try {
          assertPostgres16(result.rows[0]?.version_num);
          require("./src/server/database/postgres-guard").assertAllowedDatabase(result.rows[0]?.database_name);
        }
        catch (guardError) { return done(guardError, connection); }
        done(null, connection);
      });
    },
  };
}

function databaseConfig() {
  return {
    client: "pg",
    connection: process.env.DATABASE_URL,
    pool: guardedConnection(),
    migrations: { directory: path.join(__dirname, "database", "migrations") },
  };
}

module.exports = {
  development: {
    ...databaseConfig(),
    seeds: { directory: path.join(__dirname, "database", "seeds") },
  },
  // Production config deliberately has no seeds entry; credentials must come from deployment env.
  production: databaseConfig(),
};
