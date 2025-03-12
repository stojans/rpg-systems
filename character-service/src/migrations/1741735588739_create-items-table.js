exports.up = async (pgm) => {
  pgm.createTable("items", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    name: {
      type: "varchar(255)",
      notNull: true,
    },
    description: {
      type: "text",
    },
    bonus_strength: {
      type: "integer",
      default: 0,
    },
    bonus_agility: {
      type: "integer",
      default: 0,
    },
    bonus_intelligence: {
      type: "integer",
      default: 0,
    },
    bonus_faith: {
      type: "integer",
      default: 0,
    },
  });

  pgm.sql(`
    INSERT INTO items (name, description, bonus_strength, bonus_agility, bonus_intelligence, bonus_faith)
    VALUES
    ('Sword of Strength', 'A sword that boosts strength.', 10, 0, 0, 0),
    ('Shield of Agility', 'A shield that boosts agility.', 0, 10, 0, 0),
    ('Chestplate of Intelligence', 'A chestplate that boosts intelligence.', 0, 0, 10, 0),
    ('Ring of Faith', 'A ring that boosts faith.', 0, 0, 0, 10);
  `);
};

exports.down = async (pgm) => {
  pgm.dropTable("items");
};
