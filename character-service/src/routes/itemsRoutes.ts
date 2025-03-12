import express from "express";
import {
  assignItemToChar,
  createItem,
  getAllItems,
  getItemDetails,
  transferItem,
} from "../controllers/itemController";

import { verifyToken, checkGameMasterRole } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", verifyToken, checkGameMasterRole, getAllItems);
router.get("/:id", getItemDetails);
router.post("/", createItem);
router.post("/grant", assignItemToChar);
router.post("/gift", transferItem);

export default router;
