export interface Character {
  id: number;
  name: string;
  health: number;
  mana: number;
  baseStrength: number;
  baseAgility: number;
  baseIntelligence: number;
  baseFaith: number;
  characterClass: string;
  items: string[];
  createdBy: number;
}
