import express from "express";
import {
  createItem,
  getAllItems,
  getItemDetails,
} from "../controllers/itemController";

const router = express.Router();

router.get("/", getAllItems);
router.get("/:id", getItemDetails);
router.post("/", createItem);

export default router;
