// Required authorization constants must exist on a fresh database without development seeds.
exports.up = async function (knex) {
  await knex("roles").insert([{ name: "superadmin" }, { name: "petugas" }]).onConflict("name").ignore();
};

exports.down = async function () {
  // Role rows may already be referenced by users. Preserve them on rollback.
};
