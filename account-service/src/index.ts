import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import { createPool } from "../../shared/db";
dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);

const startService = async () => {
  try {
    const pool = createPool("account");

    await pool.connect();

    app.listen(process.env.ACCOUNT_PORT, () => {
      console.log(
        `Account Service running on http://localhost:${process.env.ACCOUNT_PORT}`
      );
    });
  } catch (error) {
    console.error("Error starting service:", error);
    process.exit(1);
  }
};

startService();
