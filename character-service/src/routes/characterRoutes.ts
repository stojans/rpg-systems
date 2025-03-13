import express from "express";
import {
  getAllCharacters,
  // getCharacter,
  createCharacter,
  getCharacterWithItems,
} from "../controllers/characterController";
import {
  verifyToken,
  checkGameMasterRole,
  checkCharacterOwnership,
} from "../../../shared/authMiddleware";

const router = express.Router();

router.get("/", verifyToken, checkGameMasterRole, getAllCharacters);
router.get("/:id", verifyToken, checkCharacterOwnership, getCharacterWithItems);
router.post("/", verifyToken, createCharacter);

export default router;
