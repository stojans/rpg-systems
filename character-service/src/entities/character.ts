import { Item } from "./item";

export enum CharacterClass {
  Warrior = "Warrior",
  Mage = "Mage",
  Rogue = "Rogue",
  Priest = "Priest",
}

export interface Character {
  id: number;
  name: string;
  health: number;
  mana: number;
  base_strength: number;
  base_agility: number;
  base_intelligence: number;
  base_faith: number;
  character_class: CharacterClass;
  items: Item[];
  created_by: number;
}
