import { Request, Response } from "express";
import axios from "axios";
import { getUserIdFromToken } from "../helpers/authHelpers";
import * as dbHelpers from "../helpers/dbHelpers";
import logger from "../../../shared/logger";
import { hasFiveMinutesPassed } from "../helpers/dbHelpers";
import redis from "../../../shared/redis";

const getCharacterDetails = async (characterId: number, token: string) => {
  try {
    const response = await axios.get(
      `http://character-service:3002/api/character/${characterId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-combat-request": "true",
        },
      }
    );
    // logger.info(`Fetched character with ID ${characterId}!`);

    return response.data;
  } catch (error) {
    logger.error(`Error fetching character details: ${error.message}`);
    throw new Error("Error fetching character details: " + error.message);
  }
};

const transferItemToWinner = async (winner: any, loser: any, token: string) => {
  const items = loser.items;
  let randomItemId: number | null = null;

  if (items && items.length > 0) {
    const randomItem = items[Math.floor(Math.random() * items.length)];
    randomItemId = randomItem.id;
    logger.info(`${winner.name} loots ${randomItem.name}!\n`);
  } else {
    logger.info(`No items available for transfer`);
    return;
  }

  try {
    const response = await axios.post(
      `http://character-service:3002/api/items/gift/`,
      {
        item_id: randomItemId,
        character_from_id: loser.id,
        character_to_id: winner.id,
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

  if (await hasFiveMinutesPassed(duelId)) {
    return res.status(403).json({
      message: `Can't ${action}. Duel expired.`,
      duelId: duelId,
    });
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

    let target = null;
    let targetHealth = 0;
    let amount: number;

    switch (action) {
      case "attack":
        target = await getCharacterDetails(targetId, token);
        targetHealth = await dbHelpers.getCharacterHealth(targetId);
        amount =
          characterDetails.total_stats.strength +
          characterDetails.total_stats.agility;
        break;
      case "cast":
        target = await getCharacterDetails(targetId, token);
        targetHealth = await dbHelpers.getCharacterHealth(targetId);
        amount = characterDetails.total_stats.intelligence * 2;
        break;
      case "heal":
        target = characterDetails;
        amount = characterDetails.total_stats.faith;
        targetHealth = characterDetails.health;

        break;
      default:
        throw new Error("Invalid action type");
    }

    await redis.del(`character:${targetId}`);
    logger.info(`Removed character with ID ${targetId} from cache!\n`);

    await redis.del(`character:${characterDetails.id}`);
    logger.info(
      `Removed character with ID ${characterDetails.id} from cache!\n`
    );

    let newHealth =
      action === "attack" || action === "cast"
        ? Math.max(targetHealth - amount, 0)
        : targetHealth + amount; // Ensure healing doesn't exceed max health

    await dbHelpers.updateCharacterHealth(target, newHealth);
    await dbHelpers.storeAction(
      duel,
      characterDetails,
      target,
      newHealth,
      action,
      amount
    );
    await dbHelpers.updateDuelTurn(duelId);
    if (action === "attack" || action === "cast") {
      const duelEnded = await dbHelpers.endDuelIfVictory(
        duelId,
        duel,
        newHealth
      );
      if (duelEnded) {
        logger.info(`${characterDetails.name} WINS duel ${duelId}!\n`);
        transferItemToWinner(characterDetails, target, token);

        return res.status(200).json({
          message: `${action.toUpperCase()} successful. Duel ended!`,
          winnerId: duel.winner_id,
          winnerName: characterDetails.name,
        });
      }
    }

    res.status(200).json({
      message: `${action.toUpperCase()} successful. Turn ${duel.turn} ended.`,
      target: target.name,
      remaining_health: newHealth,
      currentTurn: duel.turn,
    });
  } catch (error) {
    logger.error(`Error performing ${action}: ${error.message}`);

    res
      .status(500)
      .json({ message: `Error performing ${action}`, error: error.message });
  }
};
