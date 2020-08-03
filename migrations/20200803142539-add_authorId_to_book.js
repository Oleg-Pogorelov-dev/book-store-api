"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Books", "AuthorId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Authors",
        key: "id",
      },
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Books", "AuthorId");
  },
};
