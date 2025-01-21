module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    firstname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.STRING,
      allowNull: true
    },
    mobile_number: {
      type: Sequelize.STRING,
      allowNull: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    google_token: {
      type: Sequelize.STRING,
      allowNull: true
    },
    apple_token: {
      type: Sequelize.STRING,
      allowNull: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    profile_photo: {
      type: Sequelize.STRING,
      allowNull: true
    },
    RoleId: {
      type: Sequelize.INTEGER,
      references: {
        model: require("./role.model")(sequelize, Sequelize),
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
      }
    },
    reset_token: {
      type: Sequelize.STRING,
      allowNull: true
    },
    reset_token_expiry: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  // Define the relationship between User and Role models with CASCADE on delete
  const Role = require("./role.model")(sequelize, Sequelize);
  User.belongsTo(Role, { foreignKey: 'RoleId', as: 'role', onDelete: 'CASCADE' });


  User.associate = (models) => {
    User.belongsToMany(models.Salon, {
      through: 'UserSalon',
      foreignKey: 'UserId',
      otherKey: 'SalonId',
      as: 'salons',
    });
  };


  return User;
};
