'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('BarberLeaves', 'approve_by_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users', // Adjust if your table name is different
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    await queryInterface.addColumn('BarberLeaves', 'response_reason', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('BarberLeaves', 'approve_by_id');
    await queryInterface.removeColumn('BarberLeaves', 'response_reason');
  }
};
