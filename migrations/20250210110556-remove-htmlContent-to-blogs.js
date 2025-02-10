module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Blogs', 'htmlContent');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Blogs', 'htmlContent', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  }
};
