'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('BarberServices', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      BarberId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Barbers', // Ensure the table name matches your Barber model
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ServiceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Services', // Ensure the table name matches your Service model
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      SalonId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Salons', // Ensure the table name matches your Salon model
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('BarberServices');
  },
};
