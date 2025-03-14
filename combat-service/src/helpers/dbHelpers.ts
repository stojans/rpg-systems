import { createPool } from "../../../shared/db";
import { Request, Response } from "express";
import { getUserIdFromToken } from "./authHelpers";
import logger from "../../../shared/logger";

const pool = createPool("combat");

export const getDuelById = async (duelId: number) => {
  const result = await pool.query(`SELECT * FROM duels WHERE id = $1`, [
    duelId,
  ]);
  return result.rows[0] || null;
};

export const initiateDuel = async (req: Request, res: Response) => {
  const { characterId, opponentCharacterId } = req.body;
  const token = req.headers.authorization?.split(" ")[1].trim();

  const userId = await getUserIdFromToken(token);

  if (!token) {
    logger.error(`No Auth token!`);
    return res.status(400).json({ message: "Authorization token is required" });
  }

  const isMyCharacter = await isCharacterOwnedByUser(characterId, userId);

  if (!isMyCharacter) {
    logger.error(`Character ${characterId} not owned by user ${userId}!`);
    return res
      .status(400)
      .json({ message: "Initiating character must be created by you!" });
  }

  if (characterId === opponentCharacterId) {
    logger.error(`Character can't attack itself!`);
    return res.status(400).json({ message: "Character can't attack itself!" });
  }

  try {
    const duel = {
      characterId,
      opponentCharacterId,
      current_turn_character_id: characterId,
      turn: 1,
      start_time: new Date(),
      status: "ongoing",
      winner_id: null,
    };

    const result = await pool.query(
      `INSERT INTO duels (character_1_id, character_2_id, current_turn_character_id) 
      VALUES ($1, $2, $3) RETURNING id`,
      [characterId, opponentCharacterId, characterId]
    );

    const duelId = result.rows[0].id;

    logger.info(`Initiated Duel ${duelId}!`);
    res.status(200).json({
      message: `Duel ${duelId} initiated successfully`,
      duelId: duelId,
    });
  } catch (error) {
    logger.error(`Duel inititiation failed: ${error.message}!`);
    res
      .status(500)
      .json({ message: "Error initiating duel", error: error.message });
  }
};

export const updateDuelTurn = async (duelId: number) => {
  try {
    const result = await pool.query("SELECT * FROM duels WHERE id = $1", [
      duelId,
    ]);
    if (result.rows.length === 0) {
      logger.error(`Duel not found: ID ${duelId}!`);
      throw new Error("Duel not found");
    }

    const duel = result.rows[0];

    const nextTurn = duel.turn + 1;
    const nextCharacterTurn =
      duel.current_turn_character_id === duel.character_1_id
        ? duel.character_2_id
        : duel.character_1_id;

    await pool.query(
      `UPDATE duels 
         SET turn = $1, current_turn_character_id = $2 
         WHERE id = $3`,
      [nextTurn, nextCharacterTurn, duelId]
    );

    logger.info(`Turn ${nextTurn}!`);
  } catch (error) {
    logger.error(`Failed updating duel: ${error.message}`);
    console.error("Error updating duel:", error.message);
  }
};

export const endDuelIfNecessary = async (
  duelId: number,
  duel,
  opponentHealth
) => {
  if (opponentHealth > 0) return false;

  duel.status = "ended";
  duel.winner_id = duel.current_turn_character_id;
  duel.end_time = new Date();

  await pool.query(
    `UPDATE duels SET status = $1, winner_id = $2, end_time = $3 WHERE id = $4`,
    [duel.status, duel.winner_id, duel.end_time, duelId]
  );

  return true;
};

export const isUserCharacterTurn = async (
  characterId: number,
  userId: number,
  duel
) => {
  return characterId === duel.current_turn_character_id;
};

export const isCharacterOwnedByUser = async (
  characterId: number,
  userId: number
) => {
  try {
    const query = `SELECT COUNT(*) FROM foreign_characters WHERE id = $1 AND created_by = $2`;
    const values = [characterId, userId];

    const result = await pool.query(query, values);

    return result.rows[0].count > 0; // Returns true if the character belongs to the user
  } catch (error) {
    logger.error(`Error checking character ownership: ${error.message}`);
    throw new Error("Failed to check character ownership");
  }
};

export const getCharacterHealth = async (characterId: number) => {
  const result = await pool.query(
    `SELECT health FROM foreign_characters WHERE id = $1`,
    [characterId]
  );
  return result.rows.length > 0 ? result.rows[0].health : null;
};

export const updateCharacterHealth = async (
  targetId: number,
  newHealth: number
) => {
  try {
    const query = `UPDATE foreign_characters SET health = $1 WHERE id = $2`;
    const values = [newHealth, targetId];

    await pool.query(query, values);
    logger.info(`Updated health to ${newHealth} for character ID ${targetId}`);
  } catch (error) {
    logger.error(`Error updating health: ${error.message}`);
  }
};
