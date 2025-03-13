module.exports = {
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://postgres:password@localhost:5432/character_service",
  migrationsTable: "pg_migrations",
  migrationsDir: "migrations",
  direction: "up",
  logFileName: "migration.log",
};
