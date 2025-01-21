'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Barbers', 'position', {
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
      defaultValue: 'Junior',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Barbers', 'position');
  }
};
