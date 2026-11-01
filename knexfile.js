const path = require("node:path");
const { assertPostgres16 } = require("./src/server/database/postgres-guard");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

module.exports = {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    pool: {
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
    },
    migrations: { directory: path.join(__dirname, "database", "migrations") },
    seeds: { directory: path.join(__dirname, "database", "seeds") },
  },
};
