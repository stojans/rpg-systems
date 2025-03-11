export enum CharacterClass {
  Warrior = "Warrior",
  Mage = "Mage",
  Archer = "Rogue",
  Healer = "Priest",
}

export interface Character {
  id: number;
  name: string;
  health: number;
  mana: number;
  baseStrength: number;
  baseAgility: number;
  baseIntelligence: number;
  baseFaith: number;
  characterClass: CharacterClass;
  items: string[];
  createdBy: number;
}
