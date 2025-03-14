import { Request, Response } from "express";
import axios from "axios";
import { getUserIdFromToken } from "../helpers/authHelpers";
import * as dbHelpers from "../helpers/dbHelpers";
import logger from "../../../shared/logger";

const getCharacterDetails = async (characterId: number, token: string) => {
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
    logger.info(`Fetched character with ID ${characterId}!`);

    return response.data;
  } catch (error) {
    logger.error(`Error fetching character details: ${error.message}`);
    throw new Error("Error fetching character details: " + error.message);
  }
};

const transferItemToWinner = async (
  winnerId: number,
  loser: any,
  token: string
) => {
  const items = loser.items;
  let randomItemId: number | null = null;

  if (items && items.length > 0) {
    const randomItem = items[Math.floor(Math.random() * items.length)];
    randomItemId = randomItem.id;
  } else {
    logger.info(`No items available for transfer`);
    return;
  }

  try {
    const response = await axios.post(
      `http://localhost:3002/api/items/gift/`,
      {
        item_id: randomItemId,
        character_from_id: loser.id,
        character_to_id: winnerId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    logger.error(`Error transfering items: ${error.message}`);

    throw new Error("Error transfering items: " + error.message);
  }
};

// Duel session logic
export const performAction = async (
  req: Request,
  res: Response,
  action: "attack" | "heal" | "cast"
) => {
  const duelId = parseInt(req.params.duelId);
  const token = req.headers.authorization?.split(" ")[1]?.trim();
  if (!token) {
    logger.error(`No Auth token!`);

    return res.status(400).json({ message: "Authorization token is required" });
  }

  const userId = await getUserIdFromToken(token);
  const duel = await dbHelpers.getDuelById(duelId);
  if (!duel || duel.status === "ended") {
    logger.error(`Duel with ID ${duelId} not found or already ended!`);

    return res.status(400).json({ message: "Duel not found or already ended" });
  }

  try {
    const characterDetails = await getCharacterDetails(
      duel.current_turn_character_id,
      token
    );

    const isMyCharacter = await dbHelpers.isUserCharacterTurn(
      characterDetails.id,
      userId,
      duel
    );
    if (!isMyCharacter) {
      logger.error(
        `Not this character's (ID ${characterDetails.id}) turn, can't ${action}!`
      );
      return res.status(403).json({
        message: `You do not have permission to ${action}. It's not your character's turn.`,
        next_turn_char_id: duel.current_turn_character_id,
      });
    }

    let targetId =
      action === "attack" || "cast"
        ? duel.character_1_id === characterDetails.id
          ? duel.character_2_id
          : duel.character_1_id
        : characterDetails.id;

    let targetHealth = await dbHelpers.getCharacterHealth(targetId);

    const target = await getCharacterDetails(targetId, token);

    let amount: number;

    switch (action) {
      case "attack":
        amount =
          characterDetails.total_stats.strength +
          characterDetails.total_stats.agility;
        break;
      case "cast":
        amount = characterDetails.total_stats.intelligence * 2;
        break;
      case "heal":
        amount = characterDetails.total_stats.faith;
        break;
      default:
        throw new Error("Invalid action type");
    }

    let newHealth =
      action === "attack" || "cast"
        ? Math.max(targetHealth - amount, 0)
        : targetHealth + amount; // Ensure healing doesn't exceed max health

    await dbHelpers.updateCharacterHealth(targetId, newHealth);

    if (action === "attack" || action === "cast") {
      const duelEnded = await dbHelpers.endDuelIfNecessary(
        duelId,
        duel,
        newHealth
      );
      if (duelEnded) {
        transferItemToWinner(characterDetails.id, target, token);
        logger.info(
          `Character with ID ${characterDetails.id} wins duel with ID ${duelId}!`
        );

        return res.status(200).json({
          message: "Attack successful. Duel ended!",
          winnerId: duel.winner_id,
          winnerName: characterDetails.name,
        });
      }
    }

    await dbHelpers.updateDuelTurn(duelId);
    logger.info(`${action} successful, ending turn ${duel.turn}!`);
    res.status(200).json({
      message: `${
        action.charAt(0).toUpperCase() + action.slice(1)
      } successful. Turn ${duel.turn} ended.`,
      remaining_health: newHealth,
      currentTurn: duel.current_turn_character_id,
    });
  } catch (error) {
    logger.error(`Error performing ${action}: ${error.message}`);

    res
      .status(500)
      .json({ message: `Error performing ${action}`, error: error.message });
  }
};
