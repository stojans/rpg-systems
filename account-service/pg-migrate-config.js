console.log("DATABASE_URL:", process.env.DATABASE_URL);

module.exports = {
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://postgres:password@localhost:5432/account_service",
  migrationsTable: "pg_migrations",
  migrationsDir: "src/migrations",
  direction: "up",
  logFileName: "migration.log",
};
