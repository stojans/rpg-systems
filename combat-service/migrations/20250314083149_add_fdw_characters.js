exports.up = async function (knex) {
  await knex.raw(`
      CREATE EXTENSION IF NOT EXISTS postgres_fdw;
    `);

  await knex.raw(`
      CREATE SERVER IF NOT EXISTS character_service_server
      FOREIGN DATA WRAPPER postgres_fdw
      OPTIONS (host 'localhost', dbname 'character_service', port '5432');
    `);

  await knex.raw(`
      CREATE USER MAPPING IF NOT EXISTS FOR postgres
      SERVER character_service_server
      OPTIONS (user 'postgres', password 'password');
    `);

  await knex.raw(`
      CREATE FOREIGN TABLE IF NOT EXISTS foreign_characters (
        id INTEGER,
        name VARCHAR(255),
        health INTEGER,
        mana INTEGER,
        base_strength INTEGER,
        base_agility INTEGER,
        base_intelligence INTEGER,
        base_faith INTEGER,
        character_class VARCHAR(100),
        created_by INTEGER
      )
      SERVER character_service_server
      OPTIONS (schema_name 'public', table_name 'characters');
    `);

  await knex.raw(`
      CREATE FOREIGN TABLE IF NOT EXISTS foreign_character_items (
        id INTEGER,
        character_id INTEGER,
        item_id INTEGER
      )
      SERVER character_service_server
      OPTIONS (schema_name 'public', table_name 'character_items');
    `);
};

exports.down = async function (knex) {
  await knex.raw(`
      DROP FOREIGN TABLE IF EXISTS foreign_characters;
    `);

  await knex.raw(`
      DROP FOREIGN TABLE IF EXISTS foreign_character_items;
    `);

  await knex.raw(`
      DROP USER MAPPING IF EXISTS FOR postgres SERVER character_service_server;
    `);

  await knex.raw(`
      DROP SERVER IF EXISTS character_service_server;
    `);

  await knex.raw(`
      DROP EXTENSION IF EXISTS postgres_fdw;
    `);
};
