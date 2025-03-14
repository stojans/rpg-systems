exports.up = async function (knex) {
  await knex.raw(`
      CREATE EXTENSION IF NOT EXISTS postgres_fdw;
  
      CREATE SERVER IF NOT EXISTS account_service_server
      FOREIGN DATA WRAPPER postgres_fdw
      OPTIONS (host 'localhost', dbname 'account_service', port '5432');
  
      CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER
      SERVER account_service_server
      OPTIONS (user 'postgres', password 'password');
  
      CREATE FOREIGN TABLE IF NOT EXISTS users (
        id SERIAL,
        username VARCHAR(255),
        password VARCHAR(255),
        role VARCHAR(20)
      )
      SERVER account_service_server
      OPTIONS (schema_name 'public', table_name 'users');
    `);
};

exports.down = async function (knex) {
  await knex.raw(`
      DROP FOREIGN TABLE IF EXISTS users;
      DROP SERVER IF EXISTS account_service_server CASCADE;
      DROP EXTENSION IF EXISTS postgres_fdw;
    `);
};
