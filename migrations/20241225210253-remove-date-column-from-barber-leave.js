module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the old 'date' column
    await queryInterface.removeColumn('BarberLeaves', 'date');

    // Optionally, you can add any additional changes here, such as updating the column types
  },

  down: async (queryInterface, Sequelize) => {
    // In case you need to roll back the migration, add the 'date' column back
    await queryInterface.addColumn('BarberLeaves', 'date', {
      type: Sequelize.DATE,
      allowNull: false
    });
  }
};
