'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Appointments', 'SlotId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Slots', // Table name for Slot
        key: 'id',
      },
      allowNull: true,
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Ensures SlotId is set to NULL if the slot is deleted
    });

    await queryInterface.addColumn('Appointments', 'appointment_start_time', {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.addColumn('Appointments', 'appointment_end_time', {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.addColumn('Appointments', 'appointment_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Appointments', 'SlotId');
    await queryInterface.removeColumn('Appointments', 'appointment_start_time');
    await queryInterface.removeColumn('Appointments', 'appointment_end_time');
    await queryInterface.removeColumn('Appointments', 'appointment_date');
  },
};
