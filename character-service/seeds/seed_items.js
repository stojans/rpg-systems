exports.seed = async function (knex) {
  // Delete existing data to prevent duplicates
  await knex("items").del();

  // Insert default items
  await knex("items").insert([
    {
      name: "Sword of Strength",
      description: "A mighty sword",
      bonus_strength: 5,
    },
    {
      name: "Agility Boots",
      description: "Boots that increase agility",
      bonus_agility: 3,
    },
    {
      name: "Wizard Hat",
      description: "A hat that boosts intelligence",
      bonus_intelligence: 4,
    },
    {
      name: "Faith Ring",
      description: "A ring that enhances faith",
      bonus_faith: 2,
    },
  ]);
};
