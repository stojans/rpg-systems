import { Request, Response } from "express";

import { getCharacters } from "../models/characterModel";

export const getAllCharacters = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const characters = await getCharacters();
    res.status(201).json({ characters });
  } catch (error) {
    console.error("Error during characters fetching:", error);
    res.status(500).json({ message: "Server error" });
  }
};
