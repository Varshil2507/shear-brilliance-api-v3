'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('BarberSessions', 'session_date', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('BarberSessions', 'session_date', {
      type: Sequelize.DATE,
      allowNull: true
    });
  }
};