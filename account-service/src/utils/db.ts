import { Pool } from "pg";
import dotenv from "dotenv";

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

export default pool;
