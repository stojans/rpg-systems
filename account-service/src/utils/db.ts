import { Pool } from "pg";
import dotenv from "dotenv";
import migrate from "node-pg-migrate";
import path from "path";

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:password@localhost:5432/account_service";

console.log("Connecting to database with URL:", connectionString);

const pool = new Pool({
  connectionString,
});

pool.on("connect", () => {
  console.log("Database connected successfully!");
});

pool.on("error", (err, client) => {
  console.error("Error with database connection:", err);
});

const runMigrations = async () => {
  try {
    await migrate({
      databaseUrl: connectionString,
      dir: path.join(__dirname, "../migrations"),
      direction: "up",
    } as any);

    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  }
};

runMigrations();

export default pool;
