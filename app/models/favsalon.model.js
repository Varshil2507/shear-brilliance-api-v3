module.exports = (sequelize, Sequelize) => {
    const FavoriteSalon = sequelize.define("FavoriteSalon", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      SalonId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Salons',
          key: 'id',
        },
      },
      status: {
        type: Sequelize.ENUM("like", "dislike"),
        allowNull: true, // This can be null initially, or optional
      },
      device_id: {
        type: Sequelize.STRING,
        allowNull: true, // Device ID to track which device saved the salon
      }
    });

 
  FavoriteSalon.associate = (models) => {
      // Each FavoriteSalon belongs to a User
      FavoriteSalon.belongsTo(models.User, { foreignKey: 'UserId' });
      // Each FavoriteSalon refers to a Salon
      FavoriteSalon.belongsTo(models.Salon, { foreignKey: 'SalonId' });
  };

   return FavoriteSalon;
  };
  