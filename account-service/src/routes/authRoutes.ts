import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
} from "../controllers/authController";

const router = express.Router();

router.get("/users", getAllUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
