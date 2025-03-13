import { Request, Response } from "express";
import axios from "axios";
import { createPool } from "../../../shared/db";
import jwt from "jsonwebtoken";

const pool = createPool("combat");

let combatSessions: any[] = [];

const getCharacterDetails = async (characterId: number, token: string) => {
  console.log("JWT SECRET:", process.env.JWT_SECRET);

  try {
    const response = await axios.get(
      `http://localhost:3002/api/character/${characterId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-combat-request": "true",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching character details: " + error.message);
  }
};

const getUserIdFromToken = async (token: string) => {
  try {
    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken.userId;
  } catch (error) {
    throw new Error("Error decoding token: " + error.message);
  }
};

const updateDuelTurn = async (duelId: number) => {
  try {
    const result = await pool.query("SELECT * FROM duels WHERE id = $1", [
      duelId,
    ]);
    if (result.rows.length === 0) {
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

    console.log(
      `Duel ${duelId} updated to turn ${nextTurn} with character ${nextCharacterTurn}'s turn.`
    );
  } catch (error) {
    console.error("Error updating duel:", error.message);
  }
};

// Duel session logic
export const initiateDuel = async (req: Request, res: Response) => {
  const { characterId, opponentCharacterId } = req.body;
  const token = req.headers.authorization?.split(" ")[1].trim();

  if (!token) {
    return res.status(400).json({ message: "Authorization token is required" });
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

    res.status(200).json({
      message: `Duel ${duelId} initiated successfully`,
      duel: duel,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error initiating duel", error: error.message });
  }
};

export const updateHealth = async (userId: number, newHealth: number) => {
  try {
    const query = `UPDATE foreign_characters SET health = $1 WHERE id = $2`;
    const values = [newHealth, userId];

    await pool.query(query, values);

    console.log(`Updated health to ${newHealth} for character ID ${userId}`);
  } catch (error) {
    console.error("Error updating health:", error);
  }
};

export const endDuel = async (
  duelId: number,
  status: string,
  winnerId: number,
  endTime: Date
) => {
  try {
    const query = `UPDATE duels SET status = $1, winner_id = $2, end_time = $3, WHERE id = $4`;
    const values = [status, winnerId, endTime, duelId];

    await pool.query(query, values);

    console.log(
      `Duel ${duelId} finished with status ${status} with winner char ID ${winnerId}`
    );
  } catch (error) {
    console.error("Error updating duel:", error);
  }
};

export const attack = async (req: Request, res: Response) => {
  const duelId = parseInt(req.params.duelId);
  const token = req.headers.authorization?.split(" ")[1].trim();

  if (!token) {
    return res.status(400).json({ message: "Authorization token is required" });
  }

  const result = await pool.query(`SELECT * FROM duels WHERE id = $1`, [
    duelId,
  ]);

  const duel = result.rows[0];

  if (!duel || duel.status === "ended") {
    return res.status(400).json({ message: "Duel not found or already ended" });
  }

  try {
    const characterDetails = await getCharacterDetails(
      duel.current_turn_character_id,
      token
    );

    const userId = await getUserIdFromToken(token);

    // Check if the user is the owner of the current character
    const characterOwnerResult = await pool.query(
      `SELECT created_by FROM foreign_characters WHERE id = $1`,
      [duel.current_turn_character_id]
    );
    const characterOwner = characterOwnerResult.rows[0]?.created_by;

    if (!characterOwner || characterOwner !== userId) {
      return res.status(403).json({
        message:
          "You do not have permission to attack. It's not your character's turn.",
        next_turn_char_id: duel.current_turn_character_id,
      });
    }

    const opponentId =
      duel.current_turn_character_id === duel.character_1_id
        ? duel.character_2_id
        : duel.character_1_id;

    // Fetch opponent's details
    const opponentDetails = await getCharacterDetails(opponentId, token);

    const opponentHealthResult = await pool.query(
      `SELECT health FROM foreign_characters WHERE id = $1`,
      [opponentId]
    );

    if (opponentHealthResult.rows.length === 0) {
      return res.status(404).json({ message: "Opponent not found" });
    }

    opponentDetails.health = opponentHealthResult.rows[0].health;

    console.log("CHAR DET: ", characterDetails);
    console.log("OPP DET: ", opponentDetails);

    const damage =
      characterDetails.total_stats.strength +
      characterDetails.total_stats.agility;

    const newHealth = Math.max(opponentDetails.health - damage, 0);
    opponentDetails.health = newHealth;

    updateHealth(opponentId, newHealth);

    if (opponentDetails.health <= 0) {
      duel.status = "ended";
      duel.winner_id = duel.current_turn_character_id;
      duel.end_time = new Date();
      console.log("DUEL", duel);

      endDuel(duel.id, duel.status, duel.winner_id, duel.end_time);
      res.status(200).json({
        message: "Attack successful. Duel ended!",
        winner: duel.current_turn_character_id,
      });
      return;
    }

    updateDuelTurn(duelId);

    res.status(200).json({
      message: "Attack successful. Turn ended.",
      remaining_opponent_health: opponentDetails.health,
      currentTurn: duel.current_turn_character_id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error performing attack", error: error.message });
  }
};
