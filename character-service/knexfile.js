module.exports = {
  development: {
    client: "pg",
    connection: {
      host: "postgres",
      user: "postgres",
      password: "password",
      database: "character_service",
      port: 5432,
    },
    migrations: {
      directory: "./migrations",
    },
    seeds: {
      directory: "./seeds",
    },
  },
};
