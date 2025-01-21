"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Barbers", "non_working_days", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      allowNull: true,
      defaultValue: [7],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Barbers", "non_working_days");
  },
};
