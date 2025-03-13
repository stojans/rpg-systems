import express from "express";
import {
  assignItemToChar,
  createItem,
  getAllItems,
  getItemDetails,
  transferItem,
} from "../controllers/itemController";

import {
  verifyToken,
  checkGameMasterRole,
} from "../../../shared/authMiddleware";

const router = express.Router();

router.get("/", verifyToken, checkGameMasterRole, getAllItems);
router.post("/", verifyToken, createItem);
router.get("/:id", verifyToken, getItemDetails);
router.post("/grant", verifyToken, assignItemToChar);
router.post("/gift", verifyToken, transferItem);

export default router;
