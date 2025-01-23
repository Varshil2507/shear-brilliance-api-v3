'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Services', 'min_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });

    await queryInterface.changeColumn('Services', 'max_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Services', 'min_price', {
      type: Sequelize.DOUBLE,
      allowNull: false,
    });

    await queryInterface.changeColumn('Services', 'max_price', {
      type: Sequelize.DOUBLE,
      allowNull: false,
    });
  },
};
