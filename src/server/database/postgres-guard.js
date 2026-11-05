function assertPostgres16(versionNumber) {
  const version = Number(versionNumber);
  if (!Number.isInteger(version) || version < 160000) {
    throw new Error(`Perlu PostgreSQL 16 atau lebih baru, server saat ini versi ${versionNumber ?? "unknown"}`);
  }
}

function assertAllowedDatabase(databaseName, allowedName = process.env.SMART_LIBRARY_DATABASE_NAME || "smart_library") {
  if (!databaseName || databaseName !== allowedName) {
    throw new Error(`Operasi database dibatasi ke '${allowedName}', database saat ini '${databaseName ?? "unknown"}'`);
  }
}

module.exports = { assertPostgres16, assertAllowedDatabase };
