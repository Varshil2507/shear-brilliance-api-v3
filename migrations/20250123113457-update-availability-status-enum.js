'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop existing enum type if exists
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Barbers_availability_status') THEN
          DROP TYPE "enum_Barbers_availability_status";
        END IF;
      END $$;
    `);

    // Create new enum type
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Barbers_availability_status" AS ENUM(
        'available', 
        'unavailable'
      );
    `);

    // Modify Barbers table to use new enum
    await queryInterface.sequelize.query(`
      ALTER TABLE "Barbers" 
      ALTER COLUMN "availability_status" 
      TYPE "enum_Barbers_availability_status" 
      USING ("availability_status"::text::"enum_Barbers_availability_status");
    `);

    // Add additional constraints
    await queryInterface.changeColumn('Barbers', 'availability_status', {
      type: Sequelize.ENUM('available', 'unavailable'),
      allowNull: false,
      defaultValue: 'available'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes
    await queryInterface.changeColumn('Barbers', 'availability_status', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_Barbers_availability_status";
    `);
  }
};