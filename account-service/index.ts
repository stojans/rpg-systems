import express from "express";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes";
import pool from "./src/utils/db";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);

const startService = async () => {
  try {
    await pool.connect();

    app.listen(process.env.PORT, () => {
      console.log(
        `Account Service running on http://localhost:${process.env.PORT}`
      );
    });
  } catch (error) {
    console.error("Error starting service:", error);
    process.exit(1);
  }
};

startService();
