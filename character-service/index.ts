import express from "express";
import dotenv from "dotenv";
import characterRoutes from "./src/routes/characterRoutes";
import itemsRoutes from "./src/routes/itemsRoutes";
import { createPool } from "../shared/db";
import logger from "../shared/logger";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/character", characterRoutes);
app.use("/api/items", itemsRoutes);

const startService = async () => {
  try {
    const pool = createPool("character");

    await pool.connect();

    app.listen(process.env.CHARACTER_PORT, () => {
      console.log(
        `Character Service running on http://localhost:${process.env.CHARACTER_PORT}`
      );
    });
  } catch (error) {
    console.error("Error starting service:", error);
    process.exit(1);
  }
};

startService();
