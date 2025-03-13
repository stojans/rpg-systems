import express from "express";
import { performAction } from "../controllers/combatController";
import { verifyToken } from "../../../shared/authMiddleware";
import { initiateDuel } from "../helpers/dbHelpers";

const router = express.Router();

router.post("/challenge", verifyToken, initiateDuel);

router.post("/:duelId/attack", verifyToken, (req, res) =>
  performAction(req, res, "attack")
);
router.post("/:duelId/heal", verifyToken, (req, res) =>
  performAction(req, res, "heal")
);
router.post("/:duelId/cast", verifyToken, (req, res) =>
  performAction(req, res, "cast")
);

export default router;
