exports.up = async function (knex) {
  await knex.schema.createTable("student_import_jobs", (t) => {
    t.uuid("id").primary();
    t.bigInteger("created_by").notNullable().references("id").inTable("users").onDelete("RESTRICT");
    t.string("status", 20).notNullable().defaultTo("draft");
    t.jsonb("rows").notNullable();
    t.integer("total").notNullable(); t.integer("processed").notNullable().defaultTo(0);
    t.integer("inserted").notNullable().defaultTo(0); t.integer("skipped").notNullable().defaultTo(0);
    t.integer("errors").notNullable().defaultTo(0); t.text("last_error");
    t.timestamps(true, true);
    t.check("status IN ('draft','pending','processing','completed','failed')", [], "student_import_job_status_allowed");
    t.check("total BETWEEN 1 AND 5000 AND processed BETWEEN 0 AND total", [], "student_import_job_counts_valid");
    t.index(["created_by", "created_at"]);
  });
};

exports.down = async function (knex) { await knex.schema.dropTableIfExists("student_import_jobs"); };
