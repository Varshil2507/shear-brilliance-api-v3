module.exports = (sequelize, Sequelize) => {
    const FcmToken = sequelize.define("FcmToken", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true // Ensure each token is unique
      },
      device_type: {
        type: Sequelize.STRING,
        allowNull: true // e.g., 'android', 'ios', 'web'
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: require("./user.model")(sequelize, Sequelize), // Reference the User model
          key: 'id',
          deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
      }
    });
  
    // Define the relationship between FcmToken and User models with CASCADE on delete
    const User = require("./user.model")(sequelize, Sequelize);
    FcmToken.belongsTo(User, { foreignKey: 'UserId', as: 'user', onDelete: 'CASCADE' });
  
    return FcmToken;
  };