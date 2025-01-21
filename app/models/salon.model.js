module.exports = (sequelize, Sequelize) => {
  const Salon = sequelize.define("Salon", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false
    },
    phone_number: {
      type: Sequelize.STRING,
      allowNull: false
    },
    open_time: {
      type: Sequelize.TIME,
      allowNull: false
    },
    close_time: {
      type: Sequelize.TIME,
      allowNull: false
    },
    photos: {
      type: Sequelize.JSON,
      allowNull: true
    },
    google_url: {
      type: Sequelize.STRING,
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM('open', 'close'),
      allowNull: false,
      defaultValue: 'open'
    },
    services: {
      type: Sequelize.JSON,
      allowNull: true
    },
    pricing: {
      type: Sequelize.JSON,
      allowNull: true
    },
    faq: {
      type: Sequelize.JSON,
      allowNull: true
    },
    weekend_day: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    weekend_start: {
      type: Sequelize.TIME,
      allowNull: true
    },
    weekend_end: {
      type: Sequelize.TIME,
      allowNull: true
    },
    UserId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users', // Reference the Users table
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
      onDelete: 'CASCADE', // Cascade delete if the related User is deleted
      onUpdate: 'CASCADE'  // Cascade update if the related User is updated
    }
  }, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  });

  // Defining associations
  Salon.associate = (models) => {
    // One-to-many relationship with Barber
    Salon.hasMany(models.Barber, { foreignKey: 'SalonId', as: 'barbers' });

    // One-to-many relationship with FavoriteSalon
    Salon.hasMany(models.FavoriteSalon, { foreignKey: 'SalonId', as: 'favoriteSalons' });
  };

  const User = require("./user.model")(sequelize, Sequelize);
  Salon.belongsTo(User, { foreignKey: 'UserId', as: 'user' }); // New relationship

    // Define the association after the model is initialized
  Salon.associate = (models) => {
    Salon.belongsToMany(models.User, {
      through: 'UserSalon',
      foreignKey: 'SalonId',
      otherKey: 'UserId',
      as: 'users',
    });
  };
  return Salon;
};
