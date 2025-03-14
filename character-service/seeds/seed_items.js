exports.seed = async function (knex) {
  // Delete existing data to prevent duplicates
  await knex("items").del();

  // Insert default items
  await knex("items").insert([
    {
      name: "Sword",
      description: "A mighty sword that grants strength",
      bonus_strength: 5,
    },
    {
      name: "Boots",
      description: "Boots that increase agility",
      bonus_agility: 3,
    },
    {
      name: "Staff",
      description: "A staff that boosts intelligence",
      bonus_intelligence: 4,
    },
    {
      name: "Ring",
      description: "A ring that enhances faith",
      bonus_faith: 2,
    },
  ]);
};
