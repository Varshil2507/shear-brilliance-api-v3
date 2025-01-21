'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the 'category' column from the 'Barbers' table
    await queryInterface.removeColumn('Barbers', 'category');
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add the 'category' column to the 'Barbers' table
    await queryInterface.addColumn('Barbers', 'category', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // Default to '1' (ForAppointment)
      validate: {
        isIn: [[1, 2]] // Only allow 1 or 2
      }
    });
  }
};
