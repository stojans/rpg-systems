import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json("Connected");
});

app.listen(3001, () => {
  console.log("Account Service running on http://localhost:3001");
});
