import express from "express";
import {
  createItem,
  getAllItems,
  getItemDetails,
} from "../controllers/itemController";

import { verifyToken, checkGameMasterRole } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", verifyToken, checkGameMasterRole, getAllItems);
router.get("/:id", getItemDetails);
router.post("/", createItem);

export default router;
