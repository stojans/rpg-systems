exports.up = async function (knex) {
  await knex.raw(`
      CREATE EXTENSION IF NOT EXISTS postgres_fdw;
  
      CREATE SERVER IF NOT EXISTS account_service_server
      FOREIGN DATA WRAPPER postgres_fdw
      OPTIONS (host 'localhost', dbname 'account_service', port '5432');
  
      CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER
      SERVER account_service_server
      OPTIONS (user 'postgres', password 'password');
  
      CREATE FOREIGN TABLE IF NOT EXISTS public.foreign_users(
          id integer,
          username character varying(255) COLLATE pg_catalog."default",
          password character varying(255) COLLATE pg_catalog."default",
          role character varying(20) COLLATE pg_catalog."default"
      )
          SERVER account_service_server
          OPTIONS (table_name 'users');

      ALTER FOREIGN TABLE public.foreign_users
          OWNER TO postgres;
    `);
};

exports.down = async function (knex) {
  await knex.raw(`
      DROP FOREIGN TABLE IF EXISTS foreign_users;
      DROP SERVER IF EXISTS account_service_server CASCADE;
      DROP EXTENSION IF EXISTS postgres_fdw;
    `);
};
