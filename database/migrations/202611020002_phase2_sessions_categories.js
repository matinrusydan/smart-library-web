exports.up = async function (knex) {
  await knex.schema.alterTable("categories", (table) => {
    table.boolean("is_active").notNullable().defaultTo(true);
  });
  await knex.schema.createTable("sessions", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("token_hash", 64).notNullable().unique();
    table.dateTime("expires_at", { useTz: true }).notNullable();
    table.dateTime("revoked_at", { useTz: true });
    table.dateTime("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.index(["user_id", "expires_at"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("sessions");
  await knex.schema.alterTable("categories", (table) => table.dropColumn("is_active"));
};
