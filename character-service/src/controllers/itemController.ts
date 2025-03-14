import { Request, Response } from "express";
import { createPool } from "../../../shared/db";
import { Item } from "../entities/item";
import redis from "../../../shared/redis";
import logger from "../../../shared/logger";

const pool = createPool("character");

export const getAllItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const items = await getItems();
    logger.info(`Items fetched\n`);
    res.status(201).json({ items });
  } catch (error) {
    logger.error(`Error fetching items: ${error}\n`);
    res.status(500).json({ message: "Server error" });
    return;
  }
};

export const getItems = async () => {
  logger.info(`Fetching items...\n`);
  const items = await pool.query("SELECT * FROM items");
  let itemsWithSuffixes = [];

  items.rows.forEach((item) => {
    determineItemSuffix(item);
    itemsWithSuffixes.push(item);
  });

  return itemsWithSuffixes;
};

export const createItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    bonus_strength,
    bonus_agility,
    bonus_intelligence,
    bonus_faith,
    description,
    name,
  }: Item = req.body;

  logger.info(`Creating item...\n`);

  const result = await pool.query(
    "INSERT INTO items (name, description, bonus_strength, bonus_agility, bonus_intelligence, bonus_faith) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [
      name,
      description,
      bonus_strength || 0,
      bonus_agility || 0,
      bonus_intelligence || 0,
      bonus_faith || 0,
    ]
  );

  logger.info(`"${name}" created!\n`);

  res.status(201).json({ message: `Item ${name} created!` });
};

const determineItemSuffix = (item: Item) => {
  let nameSuffix = "";

  const stats = [
    { stat: "Strength", value: item.bonus_strength },
    { stat: "Agility", value: item.bonus_agility },
    { stat: "Intelligence", value: item.bonus_intelligence },
    { stat: "Faith", value: item.bonus_faith },
  ];

  const highestStats = stats
    .filter(
      (stat) =>
        stat.value ===
        Math.max(
          item.bonus_strength,
          item.bonus_agility,
          item.bonus_intelligence,
          item.bonus_faith
        )
    )
    .map((stat) => stat.stat);

  if (highestStats.length === 1) {
    nameSuffix = ` of ${highestStats[0]}`;
  } else if (highestStats.length === 2) {
    nameSuffix = ` of ${highestStats.join(" and ")}`;
  } else if (highestStats.length > 2) {
    const lastStat = highestStats.pop();
    nameSuffix = ` of ${highestStats.join(", ")} and ${lastStat}`;
  }

  const itemNameWithSuffix = `${item.name}${nameSuffix}`;

  item.name = itemNameWithSuffix;
};

export const getItemDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  logger.info(`Fetching item details for ID: ${req.params.id}...\n`);
  try {
    const result = await pool.query("SELECT * FROM items WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      logger.error(`Item with ID ${req.params.id} not found!\n`);
      res.status(404).json({ message: "Item not found" });
      return;
    }

    const item = result.rows[0];

    determineItemSuffix(item);

    console.log(item);

    logger.info(`Item details fetched!\n`);

    res.status(200).json({ item: item });
  } catch (error) {
    logger.error(`Error fetching item details: ${error}\n`);
    res.status(500).json({ message: "Server error" });
    return;
  }
};

export const assignItemToChar = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { character_id, item_id } = req.body;

  try {
    await pool.query(
      "INSERT INTO character_items (character_id, item_id) VALUES ($1, $2)",
      [character_id, item_id]
    );
    logger.info(
      `Item with ID ${item_id} assigned to character with ID ${character_id}!\n`
    );

    res.status(201).json({
      message: `Item with ID ${item_id} assigned to character with ID ${character_id}!`,
    });
  } catch (error) {
    logger.error(`Error asigning item: ${error.message}\n`);
    res.status(500).json({ error: "Server error" });
    return;
  }
};

export const transferItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { item_id, character_from_id, character_to_id } = req.body;

  if (!item_id || !character_from_id || !character_to_id) {
    logger.error(
      `Item ID, source character ID and destination character ID are required!\n`
    );
    res.status(400).json({
      message:
        "Item ID, source character ID and destination character ID are required!",
    });
    return;
  }

  try {
    await pool.query("BEGIN");

    await pool.query(
      "DELETE FROM character_items WHERE character_id = $1 AND item_id = $2",
      [character_from_id, item_id]
    );

    await pool.query(
      "INSERT INTO character_items (character_id, item_id) VALUES ($1, $2)",
      [character_to_id, item_id]
    );

    await pool.query("COMMIT");

    await redis.del(`character:${character_from_id}`);
    logger.info(`Removed character with ID ${character_from_id} from cache!\n`);
    await redis.del(`character:${character_to_id}`);
    logger.info(`Removed character with ID ${character_to_id} from cache!\n`);

    logger.info(
      `Item with ID ${item_id} transferred from character with ID ${character_from_id} to character with ID ${character_to_id}!\n`
    );

    res.status(200).json({ message: "Item transferred successfully." });
  } catch (error) {
    await pool.query("ROLLBACK");
    logger.error(`Error transfering items: ${error.message}\n`);

    res.status(500).json({ message: "Server error during item transfer." });
    return;
  }
};
