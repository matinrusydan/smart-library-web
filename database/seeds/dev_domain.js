exports.seed = async function (knex) {
  await knex("roles").insert([{ name: "superadmin" }, { name: "petugas" }]).onConflict("name").ignore();
  await knex("categories").insert([{ name: "Fiksi", description: "Karya fiksi" }, { name: "Sains", description: "Ilmu pengetahuan" }, { name: "Sejarah", description: "Sejarah dan kebudayaan" }]).onConflict("name").ignore();
};
