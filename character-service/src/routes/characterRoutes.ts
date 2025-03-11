import express from "express";
import {
  getAllCharacters,
  // getCharacter,
  // createCharacter,
} from "../controllers/characterController";

const router = express.Router();

router.get("/", getAllCharacters);
// router.get("/:id", getCharacter);
// router.post("/", createCharacter);

export default router;
