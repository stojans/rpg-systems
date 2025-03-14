exports.up = function (knex) {
  return knex.schema.createTable("duels", function (table) {
    table.increments("id").primary();
    table.integer("character_1_id").notNullable();
    table.integer("character_2_id").notNullable();
    table.integer("current_turn_character_id").notNullable();
    table.integer("turn").defaultTo(1);
    table.timestamp("start_time").defaultTo(knex.fn.now());
    table.timestamp("end_time");
    table.integer("winner_id");
    table.string("status", 50).defaultTo("ongoing");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("duels");
};
