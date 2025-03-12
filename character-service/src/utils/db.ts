import { Pool } from "pg";
import dotenv from "dotenv";
import migrate from "node-pg-migrate";
import path from "path";
import logger from "./logger";

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:password@localhost:5432/character_service";

logger.info(`Connecting to database with URL: ${connectionString}`);

const pool = new Pool({
  connectionString,
});

pool.on("connect", () => {
  logger.info(`Database connected!`);
});

pool.on("error", (err, client) => {
  logger.error(`Error with database connection: ", ${err}`);
});

const runMigrations = async () => {
  try {
    await migrate({
      databaseUrl: connectionString,
      dir: path.join(__dirname, "../migrations"),
      direction: "up",
    } as any);

    logger.info(`Migrations complete!`);
  } catch (error) {
    logger.error(`Error running migrations:", ${error}`);
    process.exit(1);
  }
};

runMigrations();

export default pool;
