import express from "express";
import dotenv from "dotenv";
import combatRoutes from "./routes/combatRoutes";
import { createPool } from "../../shared/db";
import logger from "../../shared/logger";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/", combatRoutes);

const startService = async () => {
  try {
    const pool = createPool("combat");

    await pool.connect();

    app.listen(process.env.COMBAT_PORT, () => {
      console.log(
        `Combat Service running on http://localhost:${process.env.COMBAT_PORT}`
      );
    });
  } catch (error) {
    console.error("Error starting service:", error);
    process.exit(1);
  }
};

startService();
