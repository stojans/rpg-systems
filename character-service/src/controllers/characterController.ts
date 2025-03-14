import { Request, Response } from "express";
import { createPool } from "../../../shared/db";
import { Character, CharacterClass } from "../entities/character";
import { Item } from "../entities/item";
import { ExtendedRequest } from "../../../shared/authMiddleware";
import redis from "../../../shared/redis";
import logger from "../../../shared/logger";

const pool = createPool("character");

export const getAllCharacters = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const characters = await getCharacters();
    logger.info(`Characters fetched!\n`);
    res.status(200).json({ characters });
  } catch (error) {
    logger.error(`Error fetching character: ${error}\n`);

    res.status(500).json({ message: "Server error" });
    return;
  }
};

const getCharacters = async () => {
  logger.info(`Fetching characters...\n`);
  const result = await pool.query("SELECT name, health, mana FROM characters");
  return result.rows;
};

export const getCharacterWithItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  const characterId = parseInt(req.params.id);
  const cacheKey = `character:${characterId}`;

  // logger.info(`Fetching character data for ID: ${characterId}\n`);

  const cachedCharacter = await redis.get(cacheKey);
  if (cachedCharacter) {
    logger.info(`Returning character from cache: ${characterId}\n`);
    res.status(200).json(JSON.parse(cachedCharacter));
    return;
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        characters.id AS character_id,
        characters.name,
        characters.health, 
        characters.base_strength, 
        characters.base_agility,
        characters.base_intelligence,
        characters.base_faith,
        characters.created_by,
        items.id AS item_id, 
        items.name AS item_name, 
        items.description AS item_description,
        items.bonus_strength AS bonus_strength,
        items.bonus_agility,
        items.bonus_intelligence,
        items.bonus_faith
      FROM characters
      LEFT JOIN character_items ON characters.id = character_items.character_id
      LEFT JOIN items ON character_items.item_id = items.id
      WHERE characters.id = $1;
      `,
      [characterId]
    );

    if (result.rows.length === 0) {
      logger.error(`Character ID ${characterId} not found!\n`);
      res.status(404).json({ message: "Character not found" });
      return;
    }

    const character: Character = {
      id: result.rows[0].character_id,
      name: result.rows[0].name,
      character_class: result.rows[0].character_class,
      created_by: result.rows[0].created_by,
      health: result.rows[0].health,
      mana: result.rows[0].mana,
      base_strength: result.rows[0].base_strength,
      base_agility: result.rows[0].base_agility,
      base_intelligence: result.rows[0].base_intelligence,
      base_faith: result.rows[0].base_faith,
      items: [],
    };

    let totalBonusStrength = 0;
    let totalBonusAgility = 0;
    let totalBonusIntelligence = 0;
    let totalBonusFaith = 0;

    // Loop over all rows and add items to the character
    result.rows.forEach((row: any) => {
      if (row.item_id === null) {
        return;
      }
      const item: Item = {
        id: row.item_id,
        name: row.item_name,
        description: row.item_description,
        bonus_strength: row.bonus_strength,
        bonus_agility: row.bonus_agility,
        bonus_intelligence: row.bonus_intelligence,
        bonus_faith: row.bonus_faith,
      };

      // Add the item to the character's items array
      character.items.push(item);

      // Calculate total bonus stats from all items
      totalBonusStrength += item.bonus_strength || 0;
      totalBonusAgility += item.bonus_agility || 0;
      totalBonusIntelligence += item.bonus_intelligence || 0;
      totalBonusFaith += item.bonus_faith || 0;
    });

    // Calculate total stats with bonuses
    const calculatedStats = {
      strength: character.base_strength + totalBonusStrength,
      agility: character.base_agility + totalBonusAgility,
      intelligence: character.base_intelligence + totalBonusIntelligence,
      faith: character.base_faith + totalBonusFaith,
    };

    const characterWithItems = {
      ...character,
      total_stats: calculatedStats,
    };

    await redis.set(
      cacheKey,
      JSON.stringify({ ...character, total_stats: calculatedStats }),
      "EX",
      3600
    );
    logger.info(`Cached character ID: ${characterId}\n`);

    res.status(200).json({
      ...character,
      total_stats: calculatedStats,
    });
  } catch (error) {
    logger.error(`Error fetching character ID ${characterId}: ${error}\n`);
    res.status(500).json({ message: "Server error" });
    return;
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
  req: ExtendedRequest,
  res: Response
): Promise<void> => {
  const {
    name,
    health,
    mana,
    base_strength,
    base_agility,
    base_intelligence,
    base_faith,
    character_class,
  }: Character = req.body;

  const user_id = req.user?.userId;

  // Check if user exists
  if (!user_id) {
    logger.error(`User ID ${user_id} not found!\n`);
    res.status(401).json({ message: "Unauthorized, user not found." });
    return;
  }

  if (!(await getUserById(user_id))) {
    logger.error(`User with ID ${user_id} not found!\n`);
    res.status(404).json({ message: "User not found" });
    return;
  }

  // Validate character class
  if (
    !Object.values(CharacterClass).includes(character_class as CharacterClass)
  ) {
    logger.error(`Invalid Character class!\n`);
    res
      .status(400)
      .json({ message: `Invalid character class "${character_class}".` });
    return;
  }

  // Check if char name already exists
  const nameCheck = await pool.query(
    "SELECT 1 FROM characters WHERE name = $1",
    [req.body.name]
  );
  if (nameCheck && nameCheck.rowCount && nameCheck.rowCount > 0) {
    logger.error(`Character named "${req.body.name}" already exists!\n`);
    res
      .status(400)
      .json({ message: `Character name "${req.body.name}" already exists.` });
    return;
  }

  const result = await pool.query(
    "INSERT INTO characters (name, health, mana, base_strength, base_agility, base_intelligence, base_faith, character_class, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
    [
      name,
      health,
      mana,
      base_strength,
      base_agility,
      base_intelligence,
      base_faith,
      character_class,
      user_id,
    ]
  );
  logger.info(`Character "${req.body.name}" created!\n`);

  res.status(201).json({
    message: `Character ${req.body.name} created!`,
    character: result.rows[0],
  });

  //   return result.rows[0];
};
