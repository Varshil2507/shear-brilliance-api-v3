'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns: min_price and max_price with a default value
    await queryInterface.addColumn('Services', 'min_price', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0, // Provide a default value for existing rows
    });

    await queryInterface.addColumn('Services', 'max_price', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0, // Provide a default value for existing rows
    });

    // Remove the price column
    await queryInterface.removeColumn('Services', 'price');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert: Add back the price column
    await queryInterface.addColumn('Services', 'price', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });

    // Remove the newly added columns: min_price and max_price
    await queryInterface.removeColumn('Services', 'min_price');
    await queryInterface.removeColumn('Services', 'max_price');
  },
};
