exports.up = function (knex) {
  return knex.schema.createTable("items", (table) => {
    table.increments("id").primary(); // Auto-incrementing primary key
    table.string("name", 255).notNullable(); // Item name
    table.text("description"); // Item description
    table.integer("bonus_strength").defaultTo(0); // Strength bonus
    table.integer("bonus_agility").defaultTo(0); // Agility bonus
    table.integer("bonus_intelligence").defaultTo(0); // Intelligence bonus
    table.integer("bonus_faith").defaultTo(0); // Faith bonus
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("items");
};
