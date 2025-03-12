exports.up = async (pgm) => {
  pgm.createTable("character_items", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    character_id: {
      type: "integer",
      notNull: true,
    },
    item_id: {
      type: "integer",
    },
  });

  pgm.sql(`
      INSERT INTO character_items (character_id, item_id)
      VALUES
      (1, 1),
      (2, 3),
      (3, 3);
    `);
};

exports.down = async (pgm) => {
  pgm.dropTable("items");
};
