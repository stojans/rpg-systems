exports.up = (pgm) => {
  pgm.sql(`
      CREATE EXTENSION IF NOT EXISTS postgres_fdw;
  
      CREATE SERVER IF NOT EXISTS account_service_server
      FOREIGN DATA WRAPPER postgres_fdw
      OPTIONS (host 'localhost', dbname 'account_service', port '5432');
    `);

  pgm.sql(`
      CREATE USER MAPPING IF NOT EXISTS FOR current_user
      SERVER account_service_server
      OPTIONS (user 'postgres', password 'password');
    `);

  pgm.sql(`
        
        CREATE FOREIGN TABLE IF NOT EXISTS foreign_users (
        id INTEGER,
        username VARCHAR(255),
        password VARCHAR(255),
        role VARCHAR(20)
        )
        SERVER account_service_server
        OPTIONS (table_name 'users');
    `);

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
    base_strength: {
      type: "integer",
      notNull: true,
      default: 10,
    },
    base_agility: {
      type: "integer",
      notNull: true,
      default: 10,
    },
    base_intelligence: {
      type: "integer",
      notNull: true,
      default: 10,
    },
    base_faith: {
      type: "integer",
      notNull: true,
      default: 10,
    },
    character_class: {
      type: "varchar(100)",
      notNull: true,
    },
    created_by: {
      type: "integer",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("characters");

  pgm.sql(`
      DROP USER MAPPING IF EXISTS current_user SERVER account_service_server;
      DROP SERVER IF EXISTS account_service_server;
    `);
};
