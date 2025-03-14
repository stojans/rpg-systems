exports.up = function (knex) {
  return knex.schema.createTable("characters", (table) => {
    table.increments("id").primary(); // Auto-incrementing primary key
    table.string("name", 255).notNullable().unique(); // Character name
    table.integer("health").notNullable().defaultTo(100); // Default HP
    table.integer("mana").notNullable().defaultTo(100); // Default Mana
    table.integer("base_strength").notNullable().defaultTo(10); // Strength
    table.integer("base_agility").notNullable().defaultTo(10); // Agility
    table.integer("base_intelligence").notNullable().defaultTo(10); // Intelligence
    table.integer("base_faith").notNullable().defaultTo(10); // Faith
    table.string("character_class", 100).notNullable(); // Character class
    table.integer("created_by").notNullable(); // Created by user (user_id)
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("characters");
};
