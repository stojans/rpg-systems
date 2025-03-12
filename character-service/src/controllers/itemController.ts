import { Request, Response } from "express";
import pool from "../utils/db";
import { Item } from "../entities/item";

export const getAllItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const items = await getItems();
    res.status(201).json({ items });
  } catch (error) {
    console.error("Error during items fetching:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getItems = async () => {
  const result = await pool.query("SELECT * FROM items");
  return result.rows;
};

export const createItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log(req.body);

  const {
    bonus_strength,
    bonus_agility,
    bonus_intelligence,
    bonus_faith,
    description,
    name,
  }: Item = req.body;

  const result = await pool.query(
    "INSERT INTO items (name, description, bonus_strength, bonus_agility, bonus_intelligence, bonus_faith) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [
      name,
      description,
      bonus_strength,
      bonus_agility,
      bonus_intelligence,
      bonus_faith,
    ]
  );

  res.status(201).json({ message: `Item ${name} created!` });
};

export const getItemDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query("SELECT * FROM items WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Item not found" });
    }

    const item = result.rows[0];

    // Determine item name suffix
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
    console.log(item);

    res.status(200).json({ item: item });
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ message: "Server error" });
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

    res.status(201).json({
      message: `${item_id} assigned to ${character_id}!`,
    });
  } catch (error) {
    console.error("Error assigning item to character!", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const transferItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { item_id, character_from_id, character_to_id } = req.body;

  if (!item_id || !character_from_id || !character_to_id) {
    res
      .status(400)
      .json({
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

    res.status(200).json({ message: "Item transferred successfully." });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error during item transfer:", error);
    res.status(500).json({ message: "Server error during item transfer." });
  }
};
