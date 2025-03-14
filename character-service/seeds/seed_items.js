exports.seed = async function (knex) {
  await knex("items").del();

  await knex("items").insert([
    {
      name: "Sword",
      description: "A mighty sword that grants strength",
      bonus_strength: 8,
    },
    {
      name: "Dagger",
      description: "A dagger that enhances agility and intelligence",
      bonus_agility: 7,
      bonus_agility: 5,
    },
    {
      name: "Boots",
      description: "Boots that increase agility",
      bonus_agility: 4,
    },
    {
      name: "Staff",
      description: "A staff that boosts intelligence",
      bonus_intelligence: 6,
    },
    {
      name: "Ring",
      description: "A ring that enhances strength, intelligence and faith",
      bonus_strength: 3,
      bonus_intelligence: 3,
      bonus_faith: 3,
    },
  ]);
};
