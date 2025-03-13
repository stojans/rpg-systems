import { Request, Response } from "express";
import axios from "axios";
import { getUserIdFromToken } from "../helpers/authHelpers";
import * as dbHelpers from "../helpers/dbHelpers";

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
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching character details: " + error.message);
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
  if (!token)
    return res.status(400).json({ message: "Authorization token is required" });

  const userId = await getUserIdFromToken(token);
  const duel = await dbHelpers.getDuelById(duelId);
  if (!duel)
    return res.status(400).json({ message: "Duel not found or already ended" });

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

    // let targetDetails = await getCharacterDetails(targetId, token);
    let targetHealth = await dbHelpers.getCharacterHealth(targetId);

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
      if (duelEnded)
        return res.status(200).json({
          message: "Attack successful. Duel ended!",
          winner: duel.winner_id,
        });
    }

    await dbHelpers.updateDuelTurn(duelId);
    res.status(200).json({
      message: `${
        action.charAt(0).toUpperCase() + action.slice(1)
      } successful. Turn ended.`,
      remaining_health: newHealth,
      currentTurn: duel.current_turn_character_id,
    });

    console.log("TARGET ID:", newHealth);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error performing ${action}`, error: error.message });
  }
};
