/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["knex", "pg", "argon2"],
};

export default nextConfig;
