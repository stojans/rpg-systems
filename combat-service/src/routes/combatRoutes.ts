import express from "express";
import { initiateDuel, attack } from "../controllers/combatController";
import { verifyToken } from "../../../shared/authMiddleware";

const router = express.Router();

router.post("/challenge", verifyToken, initiateDuel);

router.post("/:duelId/attack", verifyToken, attack);

export default router;
