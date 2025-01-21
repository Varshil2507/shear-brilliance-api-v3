module.exports = (sequelize, Sequelize) => {
    const UserSalon = sequelize.define("UserSalon", {
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
          deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      SalonId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Salons',
          key: 'id',
          deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      // You can also add extra fields here if needed, e.g., role in the salon
    });

    // Define associations
  UserSalon.associate = function(models) {
    UserSalon.belongsTo(models.User, { foreignKey: 'UserId' });
    UserSalon.belongsTo(models.Salon, { foreignKey: 'SalonId' });
  };
  
    return UserSalon;
  };