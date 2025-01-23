'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('BarberServices', 'price', {
      type: Sequelize.DECIMAL(10, 2), // Change to DECIMAL with 2 decimal places
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('BarberServices', 'price', {
      type: Sequelize.FLOAT, // Revert back to FLOAT if needed
      allowNull: false,
    });
  }
};

