import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import logger from "./logger";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const pools: { [key: string]: Pool } = {};

const getDatabaseUrl = (serviceName: string): string | undefined => {
  const dbUrl = process.env[`${serviceName.toUpperCase()}_DB_URL`];
  if (!dbUrl) {
    logger.error(
      `Database URL for ${serviceName} is not defined in the .env file`
    );
    throw new Error(
      `Database URL for ${serviceName} is not defined in the .env file`
    );
  }
  return dbUrl;
};

export const createPool = (serviceName: string): Pool => {
  if (!pools[serviceName]) {
    const dbUrl = getDatabaseUrl(serviceName);
    pools[serviceName] = new Pool({ connectionString: dbUrl });
    logger.info(`Created pool for ${serviceName}_service with URL: ${dbUrl}`);
  }
  return pools[serviceName];
};
