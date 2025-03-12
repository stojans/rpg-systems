import express from "express";
import dotenv from "dotenv";
import characterRoutes from "./src/routes/characterRoutes";
import itemsRoutes from "./src/routes/itemsRoutes";
import pool from "./src/utils/db";
import logger from "./src/utils/logger";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/character", characterRoutes);
app.use("/api/items", itemsRoutes);

const startService = async () => {
  try {
    await pool.connect();

    logger.info("Server is starting...");

    app.listen(process.env.PORT, () => {
      logger.info(`Server running on port ${process.env.PORT}!`);
    });
  } catch (error) {
    logger.error(`Error starting service: ${error}`);
    process.exit(1);
  }
};

startService();
