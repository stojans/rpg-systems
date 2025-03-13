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
router.post("/", createItem);
router.get("/:id", getItemDetails);
router.post("/grant", assignItemToChar);
router.post("/gift", transferItem);

export default router;
