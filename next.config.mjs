/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["knex", "pg", "argon2", "exceljs", "jszip", "@xmldom/xmldom"],
};

export default nextConfig;
