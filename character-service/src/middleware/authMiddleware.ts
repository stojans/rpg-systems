import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface ExtendedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

const secretKey = process.env.JWT_SECRET || "your_secret_key";

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
      id: string;
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
