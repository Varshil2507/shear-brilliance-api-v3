'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('BarberSessions', 'category', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // Default value to set for existing records
      validate: {
        isIn: [[1, 2]], // Ensure the value is either 1 or 2
      },
    });

    await queryInterface.addColumn('BarberSessions', 'position', {
      type: Sequelize.ENUM(
        'Senior',
        'Master',
        'Executive',
        'Braider',
        'Junior',
        'Trainee',
        'Student'
      ),
      allowNull: false,
      defaultValue: 'Junior', // Default value for position
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('BarberSessions', 'category');
    await queryInterface.removeColumn('BarberSessions', 'position');
  },
};
