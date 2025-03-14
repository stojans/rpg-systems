exports.up = function (knex) {
  return knex.schema.createTable("duel_actions", function (table) {
    table.increments("id").primary();

    table.integer("duel_id").unsigned().references("id").inTable("duels");

    table.integer("turn").notNullable();

    // Actor (the one performing the action)
    table.integer("actor_id").unsigned();
    table.string("actor_name");

    table.string("action").notNullable();
    table.integer("amount").notNullable();

    // Target (the one receiving the action)
    table.integer("target_id").unsigned();
    table.string("target_name");
    table.integer("target_health");

    table.timestamp("timestamp").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("duel_actions");
};
