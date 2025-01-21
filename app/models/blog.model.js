module.exports = (sequelize, Sequelize) => {
    const Blog = sequelize.define("Blog", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
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
      image: {
        type: Sequelize.STRING,
        allowNull: true // You can choose whether image is optional or required
      }
    });
  
    return Blog;
  };
  