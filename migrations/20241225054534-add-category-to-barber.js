'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Barbers', 'category', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // Default value is '1' (ForAppointment)
      validate: {
        isIn: [[1, 2]] // Allow only '1' or '2'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Barbers', 'category');
  }
};
