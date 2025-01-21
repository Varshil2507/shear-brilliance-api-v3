'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adding the start_date and end_date columns temporarily with allowNull: true
    await queryInterface.addColumn('BarberLeaves', 'start_date', {
      type: Sequelize.DATE,
      allowNull: true,  // Allow null temporarily
    });

    await queryInterface.addColumn('BarberLeaves', 'end_date', {
      type: Sequelize.DATE,
      allowNull: true,  // Allow null temporarily
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Removing the start_date and end_date columns
    await queryInterface.removeColumn('BarberLeaves', 'start_date');
    await queryInterface.removeColumn('BarberLeaves', 'end_date');
  }
};
