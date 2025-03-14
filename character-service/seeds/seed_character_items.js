exports.seed = async function (knex) {
  await knex("character_items").del();

  const characters = await knex("characters").select("id");

  if (characters.length === 0) {
    console.log("No characters found, skipping character_items insert.");
    return;
  }

  const items = await knex("items").select("id");

  if (items.length === 0) {
    console.log("No items found, skipping character_items insert.");
    return;
  }

  await knex("character_items").insert([
    { character_id: characters[0].id, item_id: items[0].id },
    { character_id: characters[1].id, item_id: items[1].id },
    { character_id: characters[2].id, item_id: items[2].id },
  ]);
};
