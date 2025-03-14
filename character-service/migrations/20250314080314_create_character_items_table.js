exports.up = function (knex) {
  return knex.schema.createTable("character_items", (table) => {
    table.increments("id").primary(); // Auto-incrementing primary key
    table.integer("character_id").notNullable(); // Character reference
    table.integer("item_id"); // Item reference

    // Foreign keys (Remove this if using FDW instead of enforcing locally)
    table
      .foreign("character_id")
      .references("characters.id")
      .onDelete("CASCADE");
    table.foreign("item_id").references("items.id").onDelete("SET NULL");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("character_items");
};
