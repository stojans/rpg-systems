import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createPool } from "../../../shared/db";

export interface ExtendedRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
  body: any;
  params: {
    id?: string;
  };
  header: any;
}

const secretKey = process.env.JWT_SECRET;
const pool = createPool("character");

export const verifyToken = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(token, secretKey) as {
      userId: number;
      role: string;
    };

    (req as any).user = decoded;

    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};

export const checkGameMasterRole = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "GameMaster") {
    res.status(403).json({ message: "Access denied. GameMasters only." });
    return;
  }

  next();
};

export const checkCharacterOwnership = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const characterId = req.params.id;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!userId) {
    res
      .status(401)
      .json({ message: "Unauthorized. No user ID found in token." });
    return;
  }

  try {
    // Check if the character was created by the logged-in user OR logged in user is GameMaster
    const result = await pool.query("SELECT * FROM characters WHERE id = $1", [
      characterId,
    ]);

    if (result.rowCount === 0) {
      res.status(404).json({ message: "Character not found." });
      return;
    }

    const character = result.rows[0];

    if (character.created_by !== userId && userRole !== "GameMaster") {
      res.status(403).json({
        message: "You do not have permission to access this character.",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Error fetching character:", error);
    res.status(500).json({ message: "Server error." });
  }
};
