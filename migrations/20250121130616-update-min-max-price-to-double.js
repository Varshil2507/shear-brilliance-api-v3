'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update the `min_price` column to DOUBLE
    await queryInterface.changeColumn('Services', 'min_price', {
      type: Sequelize.DOUBLE,
      allowNull: false,
    });

    // Update the `max_price` column to DOUBLE
    await queryInterface.changeColumn('Services', 'max_price', {
      type: Sequelize.DOUBLE,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the `min_price` column back to FLOAT
    await queryInterface.changeColumn('Services', 'min_price', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });

    // Revert the `max_price` column back to FLOAT
    await queryInterface.changeColumn('Services', 'max_price', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
  }
};
