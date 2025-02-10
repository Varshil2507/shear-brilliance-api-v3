module.exports = (sequelize, Sequelize) => {
    const Blog = sequelize.define("Blog", {
      id: {
        type: Sequelize.UUID, // Change type to UUID
        defaultValue: Sequelize.UUIDV4, // Auto-generate UUIDs
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      htmlContent: {
        type: Sequelize.TEXT,
        allowNull: true
      },      
      image: {
        type: Sequelize.STRING,
        allowNull: true // You can choose whether image is optional or required
      }
    });
  
    return Blog;
  };
  