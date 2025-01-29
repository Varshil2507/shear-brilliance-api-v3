'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Barbers', 'default_start_time');
    await queryInterface.removeColumn('Barbers', 'default_end_time');
    await queryInterface.addColumn('Barbers', 'weekly_schedule', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {
        monday: { start_time: null, end_time: null },
        tuesday: { start_time: null, end_time: null },
        wednesday: { start_time: null, end_time: null },
        thursday: { start_time: null, end_time: null },
        friday: { start_time: null, end_time: null },
        saturday: { start_time: null, end_time: null },
        sunday: { start_time: null, end_time: null }
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Barbers', 'weekly_schedule');
    await queryInterface.addColumn('Barbers', 'default_start_time', {
      type: Sequelize.TIME,
      allowNull: true
    });
    await queryInterface.addColumn('Barbers', 'default_end_time', {
      type: Sequelize.TIME,
      allowNull: true
    });
  }
};