exports.seed = async function (knex) {
  await knex("characters").del();

  await knex("characters").insert([
    {
      name: "Warrior",
      health: 120,
      mana: 20,
      base_strength: 20,
      base_agility: 7,
      base_intelligence: 3,
      base_faith: 4,
      character_class: "Warrior",
      created_by: 1,
    },
    {
      name: "Mage",
      health: 80,
      mana: 200,
      base_strength: 2,
      base_agility: 1,
      base_intelligence: 25,
      base_faith: 8,
      character_class: "Mage",
      created_by: 1,
    },
    {
      name: "Rogue",
      health: 80,
      mana: 10,
      base_strength: 10,
      base_agility: 20,
      base_intelligence: 6,
      base_faith: 2,
      character_class: "Rogue",
      created_by: 2,
    },
    {
      name: "Priest",
      health: 50,
      mana: 150,
      base_strength: 1,
      base_agility: 2,
      base_intelligence: 15,
      base_faith: 17,
      character_class: "Priest",
      created_by: 2,
    },
  ]);
};
