exports.up = (pgm) => {
  // Create the foreign server to connect to the account_service database
  pgm.sql(`
      CREATE EXTENSION IF NOT EXISTS postgres_fdw;
  
      CREATE SERVER account_service_server
      FOREIGN DATA WRAPPER postgres_fdw
      OPTIONS (host 'localhost', dbname 'account_service', port '5432');
    `);

  // Create a user mapping for the connection to the account_service database
  pgm.sql(`
      CREATE USER MAPPING FOR current_user
      SERVER account_service_server
      OPTIONS (user 'account_service_user', password 'password');
    `);

  // Create the characters table
  pgm.createTable("characters", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    name: {
      type: "varchar(255)",
      notNull: true,
      unique: true,
    },
    health: {
      type: "integer",
      notNull: true,
      default: 100,
    },
    mana: {
      type: "integer",
      notNull: true,
      default: 100,
    },
    baseStrength: {
      type: "integer",
      notNull: true,
      default: 10,
    },
    baseAgility: {
      type: "integer",
      notNull: true,
      default: 10,
    },
    baseIntelligence: {
      type: "integer",
      notNull: true,
      default: 10,
    },
    baseFaith: {
      type: "integer",
      notNull: true,
      default: 10,
    },
    class: {
      type: "varchar(100)",
      notNull: true,
    },
    // createdBy: {
    //   type: "integer",
    //   references: "account_service.public.users(id)",
    //   onDelete: "SET NULL",
    // },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("characters");

  // Drop the user mapping and foreign server setup if necessary
  pgm.sql(`
      DROP USER MAPPING IF EXISTS current_user SERVER account_service_server;
      DROP SERVER IF EXISTS account_service_server;
    `);
};
