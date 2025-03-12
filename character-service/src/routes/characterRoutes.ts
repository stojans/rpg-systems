import express from "express";
import {
  getAllCharacters,
  // getCharacter,
  createCharacter,
  getCharacterWithItems,
} from "../controllers/characterController";
import { verifyToken, checkGameMasterRole } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", verifyToken, checkGameMasterRole, getAllCharacters);
router.get("/:id", getCharacterWithItems);
router.post("/", verifyToken, createCharacter);

export default router;
