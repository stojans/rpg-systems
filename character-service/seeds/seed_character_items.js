exports.seed = async function (knex) {
  // Deletes ALL existing entries in character_items
  await knex("character_items").del();

  // Make sure characters table has data
  const characters = await knex("characters").select("id");

  // Check if there are characters available
  if (characters.length === 0) {
    console.log("No characters found, skipping character_items insert.");
    return;
  }

  // Assuming you have an items table and the items exist
  const items = await knex("items").select("id");

  // Check if there are items available
  if (items.length === 0) {
    console.log("No items found, skipping character_items insert.");
    return;
  }

  // Now you can safely insert character_items
  await knex("character_items").insert([
    { character_id: characters[0].id, item_id: items[0].id },
    { character_id: characters[1].id, item_id: items[1].id },
    { character_id: characters[2].id, item_id: items[2].id },
  ]);
};
