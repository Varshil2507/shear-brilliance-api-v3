'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add weekly_schedule column
    await queryInterface.addColumn('Barbers', 'weekly_schedule', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {
        Monday: { start_time: '09:00', end_time: '22:00' },
        Tuesday: { start_time: '09:00', end_time: '18:00' },
        Wednesday: { start_time: '09:00', end_time: '17:00' },
        Thursday: { start_time: '09:00', end_time: '14:00' },
        Friday: { start_time: '09:00', end_time: '13:00' },
        Saturday: { start_time: '09:00', end_time: '15:00' },
        Sunday: { start_time: '09:00', end_time: '16:00' }
      }
    });

    // Remove default_start_time and default_end_time columns
    await queryInterface.removeColumn('Barbers', 'default_start_time');
    await queryInterface.removeColumn('Barbers', 'default_end_time');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert: remove weekly_schedule
    await queryInterface.removeColumn('Barbers', 'weekly_schedule');

    // Revert: add back default_start_time and default_end_time
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