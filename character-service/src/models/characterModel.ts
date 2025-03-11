import pool from "../utils/db";

export interface Character {
  id: number;
  name: string;
  health: number;
  mana: number;
  baseStrength: number;
  baseAgility: number;
  baseIntelligence: number;
  baseFaith: number;
  class: string;
  items: string[];
  createdBy: number | null;
}

export const getCharacters = async () => {
  const result = await pool.query("SELECT * FROM characters");
  return result.rows;
};
