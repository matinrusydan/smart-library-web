const path = require("node:path");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

module.exports = {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    migrations: { directory: path.join(__dirname, "database", "migrations") },
    seeds: { directory: path.join(__dirname, "database", "seeds") },
  },
};
