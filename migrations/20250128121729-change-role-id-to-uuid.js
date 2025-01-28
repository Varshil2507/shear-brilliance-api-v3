module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.sequelize.transaction(async (transaction) => {
        // Step 1: Enable UUID extension
        try {
          await queryInterface.sequelize.query(
            'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
            { transaction }
          );
          console.log('UUID extension created/enabled successfully');
        } catch (error) {
          console.error('Error creating UUID extension:', error);
          throw error;
        }

        // Step 2: Add temporary UUID columns
        try {
          await queryInterface.addColumn(
            "Roles",
            "id_new",
            {
              type: Sequelize.UUID,
              defaultValue: Sequelize.literal("uuid_generate_v4()"),
              allowNull: false,
            },
            { transaction }
          );
          console.log('Added id_new to Roles');

          await queryInterface.addColumn(
            "Users",
            "RoleId_temp",
            {
              type: Sequelize.UUID,
              allowNull: true,
            },
            { transaction }
          );
          console.log('Added RoleId_temp to Users');
        } catch (error) {
          console.error('Error adding temporary columns:', error);
          throw error;
        }

        // Step 3: Map old Role IDs to new UUIDs
        try {
          await queryInterface.sequelize.query(
            `UPDATE "Users" 
             SET "RoleId_temp" = "Roles"."id_new" 
             FROM "Roles" 
             WHERE "Users"."RoleId" = "Roles"."id"`,
            { transaction }
          );
          console.log('Mapped Role IDs to UUIDs successfully');
        } catch (error) {
          console.error('Error mapping Role IDs:', error);
          throw error;
        }

        // Step 4: Remove old foreign key constraints
        try {
          // Get current foreign key constraints
          const [results] = await queryInterface.sequelize.query(
            `SELECT constraint_name 
             FROM information_schema.key_column_usage 
             WHERE table_name = 'Users' 
             AND column_name = 'RoleId' 
             AND constraint_name != 'unique_Users_RoleId'`
          );

          if (results.length > 0) {
            const constraintName = results[0].constraint_name;
            console.log(`Found foreign key constraint: ${constraintName}`);
            
            await queryInterface.removeConstraint(
              "Users",
              constraintName,
              { transaction }
            );
            console.log(`Removed constraint ${constraintName} successfully`);
          } else {
            console.log('No foreign key constraint found for RoleId');
          }
        } catch (error) {
          console.error('Error removing foreign key constraint:', error);
          throw error;
        }

        // Step 5: Drop original columns
        try {
          await queryInterface.removeColumn("Users", "RoleId", { transaction });
          console.log('Removed old RoleId column from Users');
          
          await queryInterface.removeColumn("Roles", "id", { transaction });
          console.log('Removed old id column from Roles');
        } catch (error) {
          console.error('Error removing old columns:', error);
          throw error;
        }

        // Step 6: Rename new columns
        try {
          await queryInterface.renameColumn(
            "Roles",
            "id_new",
            "id",
            { transaction }
          );
          console.log('Renamed id_new to id in Roles');
          
          await queryInterface.renameColumn(
            "Users",
            "RoleId_temp",
            "RoleId",
            { transaction }
          );
          console.log('Renamed RoleId_temp to RoleId in Users');
        } catch (error) {
          console.error('Error renaming columns:', error);
          throw error;
        }

        // Step 7: Add new constraints
        try {
          await queryInterface.addConstraint("Roles", {
            fields: ["id"],
            type: "primary key",
            name: "Roles_pkey",
            transaction,
          });
          console.log('Added primary key constraint to Roles');

          await queryInterface.addConstraint("Users", {
            fields: ["RoleId"],
            type: "foreign key",
            name: "Users_RoleId_fkey",
            references: {
              table: "Roles",
              field: "id",
            },
            onDelete: "CASCADE",
            transaction,
          });
          console.log('Added new foreign key constraint to Users');
        } catch (error) {
          console.error('Error adding new constraints:', error);
          throw error;
        }
      });
    } catch (error) {
      console.error('Migration failed with error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.warn('Rollback not implemented for this migration');
    // Implement rollback logic here if needed
  }
};