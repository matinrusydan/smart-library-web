exports.up = async function (knex) {
  await knex.schema.createTable("roles", (t) => {
    t.bigIncrements("id").primary(); t.string("name", 32).notNullable().unique(); t.timestamps(true, true);
    t.check("name IN ('superadmin', 'petugas')", [], "roles_name_allowed");
  });
  await knex.schema.createTable("users", (t) => {
    t.bigIncrements("id").primary(); t.bigInteger("role_id").notNullable().references("id").inTable("roles").onDelete("RESTRICT");
    t.string("username", 64).notNullable().unique(); t.string("name", 160).notNullable(); t.string("password_hash", 255).notNullable();
    t.boolean("is_active").notNullable().defaultTo(true); t.timestamps(true, true); t.index(["role_id", "is_active"]);
  });
  await knex.schema.createTable("categories", (t) => {
    t.bigIncrements("id").primary(); t.string("name", 120).notNullable().unique(); t.text("description"); t.timestamps(true, true);
  });
  await knex.schema.createTable("books", (t) => {
    t.bigIncrements("id").primary(); t.bigInteger("category_id").notNullable().references("id").inTable("categories").onDelete("RESTRICT");
    t.string("isbn", 20).unique(); t.string("title", 255).notNullable(); t.string("author", 180).notNullable(); t.string("publisher", 180);
    t.integer("publication_year"); t.integer("stock_total").notNullable().defaultTo(0); t.integer("stock_available").notNullable().defaultTo(0);
    t.timestamps(true, true); t.check("stock_total >= 0 AND stock_available >= 0 AND stock_available <= stock_total", [], "books_stock_valid");
    t.index(["category_id", "title"]);
  });
  await knex.schema.createTable("students", (t) => {
    t.bigIncrements("id").primary(); t.string("student_number", 40).notNullable().unique(); t.string("name", 180).notNullable();
    t.string("class_name", 80); t.string("email", 254); t.string("phone", 32); t.boolean("is_active").notNullable().defaultTo(true); t.timestamps(true, true);
  });
  await knex.schema.createTable("borrowings", (t) => {
    t.bigIncrements("id").primary(); t.bigInteger("student_id").notNullable().references("id").inTable("students").onDelete("RESTRICT");
    t.bigInteger("user_id").notNullable().references("id").inTable("users").onDelete("RESTRICT");
    t.date("borrowed_at").notNullable(); t.date("due_at").notNullable(); t.date("returned_at");
    t.string("status", 20).notNullable().defaultTo("borrowed"); t.text("notes"); t.timestamps(true, true);
    t.check("status IN ('borrowed', 'returned', 'overdue')", [], "borrowings_status_valid");
    t.check("due_at >= borrowed_at AND (returned_at IS NULL OR returned_at >= borrowed_at)", [], "borrowings_dates_valid");
    t.index(["student_id", "status"]); t.index(["due_at", "status"]);
  });
  await knex.schema.createTable("borrowing_items", (t) => {
    t.bigIncrements("id").primary(); t.bigInteger("borrowing_id").notNullable().references("id").inTable("borrowings").onDelete("CASCADE");
    t.bigInteger("book_id").notNullable().references("id").inTable("books").onDelete("RESTRICT"); t.integer("quantity").notNullable().defaultTo(1);
    t.timestamps(true, true); t.unique(["borrowing_id", "book_id"]); t.check("quantity > 0", [], "borrowing_items_quantity_positive");
  });
  await knex.schema.createTable("fines", (t) => {
    t.bigIncrements("id").primary(); t.bigInteger("borrowing_id").notNullable().references("id").inTable("borrowings").onDelete("RESTRICT");
    t.bigInteger("student_id").notNullable().references("id").inTable("students").onDelete("RESTRICT"); t.bigInteger("amount").notNullable();
    t.bigInteger("paid_amount").notNullable().defaultTo(0); t.string("reason", 255).notNullable(); t.string("status", 20).notNullable().defaultTo("unpaid");
    t.timestamps(true, true); t.check("amount >= 0 AND paid_amount >= 0 AND paid_amount <= amount", [], "fines_amount_valid");
    t.check("status IN ('unpaid', 'partial', 'paid')", [], "fines_status_valid"); t.index(["student_id", "status"]);
  });
  await knex.schema.createTable("payments", (t) => {
    t.bigIncrements("id").primary(); t.bigInteger("fine_id").notNullable().references("id").inTable("fines").onDelete("RESTRICT");
    t.bigInteger("user_id").notNullable().references("id").inTable("users").onDelete("RESTRICT"); t.bigInteger("amount").notNullable();
    t.dateTime("paid_at", { useTz: true }).notNullable().defaultTo(knex.fn.now()); t.string("method", 30); t.string("reference", 120); t.timestamps(true, true);
    t.check("amount > 0", [], "payments_amount_positive"); t.index(["fine_id", "paid_at"]);
  });
  await knex.schema.createTable("audit_logs", (t) => {
    t.bigIncrements("id").primary(); t.bigInteger("user_id").nullable().references("id").inTable("users").onDelete("SET NULL");
    t.string("action", 100).notNullable(); t.string("entity_type", 80).notNullable(); t.string("entity_id", 80); t.jsonb("details");
    t.string("ip_address", 45); t.dateTime("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now()); t.index(["entity_type", "entity_id"]); t.index(["created_at"]);
  });
};

exports.down = async function (knex) {
  for (const table of ["audit_logs", "payments", "fines", "borrowing_items", "borrowings", "students", "books", "categories", "users", "roles"]) await knex.schema.dropTableIfExists(table);
};
