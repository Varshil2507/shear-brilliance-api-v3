'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Barbers', 'default_service_time');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Barbers', 'default_service_time', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
