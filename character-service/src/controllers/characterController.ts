import { Request, Response } from "express";
import pool from "../utils/db";

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

const getCharacters = async () => {
  const result = await pool.query("SELECT * FROM characters");
  return result.rows;
};

export const getCharacter = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const result = await pool.query("SELECT * FROM characters WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Character not found" });
    }

    const character = result.rows[0];

    res.status(200).json({ character: character });
  } catch (error) {
    console.error("Error fetching character:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (userId: number) => {
  const result = await pool.query(
    "SELECT id FROM foreign_users WHERE id = $1",
    [userId]
  );
  return result.rows.length > 0;
};

export const createCharacter = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { createdBy } = req.body;
  console.log(req.body);

  if (!(await getUserById(createdBy))) {
    return res.status(404).json({ message: "User not found" });
  }

  const nameCheck = await pool.query(
    "SELECT 1 FROM characters WHERE name = $1",
    [req.body.name]
  );
  if (nameCheck && nameCheck.rowCount && nameCheck.rowCount > 0) {
    return res
      .status(400)
      .json({ message: `Character name "${req.body.name}" already exists.` });
  }

  const result = await pool.query(
    "INSERT INTO characters (name, health, mana, base_strength, base_agility, base_intelligence, base_faith, character_class, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
    [
      req.body.name,
      req.body.health,
      req.body.mana,
      req.body.baseStrength,
      req.body.baseAgility,
      req.body.baseIntelligence,
      req.body.baseFaith,
      req.body.characterClass,
      req.body.createdBy,
    ]
  );
  res.status(201).json({ message: `Character ${req.body.name} created!` });

  //   return result.rows[0];
};
