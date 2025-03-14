exports.seed = async function (knex) {
  await knex("characters").del();

  await knex("characters").insert([
    {
      name: "Aragorn",
      health: 120,
      mana: 50,
      base_strength: 18,
      base_agility: 14,
      base_intelligence: 10,
      base_faith: 8,
      character_class: "Warrior",
      created_by: 1,
    },
    {
      name: "Gandalf",
      health: 80,
      mana: 200,
      base_strength: 8,
      base_agility: 10,
      base_intelligence: 25,
      base_faith: 20,
      character_class: "Mage",
      created_by: 2,
    },
    {
      name: "Legolas",
      health: 100,
      mana: 75,
      base_strength: 12,
      base_agility: 20,
      base_intelligence: 12,
      base_faith: 10,
      character_class: "Archer",
      created_by: 3,
    },
  ]);
};
