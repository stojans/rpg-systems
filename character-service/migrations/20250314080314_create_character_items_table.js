exports.up = function (knex) {
  return knex.schema.createTable("character_items", (table) => {
    table.increments("id").primary();
    table.integer("character_id").notNullable();
    table.integer("item_id");

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
