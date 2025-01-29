module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.sequelize.transaction(async (transaction) => {
        // Step 1: Enable UUID extension
        await queryInterface.sequelize.query(
          'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
          { transaction }
        );

        // Step 2: Add new UUID column
        await queryInterface.addColumn(
          "Blogs",
          "id_new",
          {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal("uuid_generate_v4()"),
            allowNull: false,
            primaryKey: true,
          },
          { transaction }
        );

        // Step 3: Migrate data from old ID column to new UUID column
        await queryInterface.sequelize.query(
          `UPDATE "Blogs" SET "id_new" = uuid_generate_v4();`,
          { transaction }
        );

        // Step 4: Fetch existing primary key constraint name
        const [results] = await queryInterface.sequelize.query(
          `SELECT constraint_name 
           FROM information_schema.table_constraints 
           WHERE table_name = 'Blogs' 
           AND constraint_type = 'PRIMARY KEY'`,
          { transaction }
        );

        if (results.length > 0) {
          const constraintName = results[0].constraint_name;
          console.log(`Found primary key constraint: ${constraintName}`);

          // Remove old primary key constraint dynamically
          await queryInterface.removeConstraint("Blogs", constraintName, {
            transaction,
          });
        } else {
          console.log("No primary key constraint found for Blogs");
        }

        // Step 5: Drop the old `id` column
        await queryInterface.removeColumn("Blogs", "id", { transaction });

        // Step 6: Rename `id_new` to `id`
        await queryInterface.renameColumn("Blogs", "id_new", "id", {
          transaction,
        });

        // Step 7: Add new primary key constraint
        await queryInterface.addConstraint("Blogs", {
          fields: ["id"],
          type: "primary key",
          name: "Blogs_pkey",
          transaction,
        });

        console.log("Migration completed successfully");
      });
    } catch (error) {
      console.error("Migration failed:", error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.warn("Rollback not implemented for this migration");
    // Implement rollback logic if needed
  },
};
