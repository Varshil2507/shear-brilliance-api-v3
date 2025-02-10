module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Blogs", "htmlContent", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Blogs", "htmlContent");
  }
};
