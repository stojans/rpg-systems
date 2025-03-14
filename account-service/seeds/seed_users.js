exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("users").del();

  // Inserts seed entries
  await knex("users").insert([
    {
      username: "admin1",
      password: "adminpassword1", // use a hashed password in a real app
      role: "admin",
    },
    {
      username: "player1",
      password: "playerpassword1", // use a hashed password in a real app
      role: "player",
    },
    {
      username: "gameMaster",
      password: "gameMasterpassword", // use a hashed password in a real app
      role: "gameMaster",
    },
  ]);
};
