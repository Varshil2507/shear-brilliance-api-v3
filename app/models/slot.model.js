module.exports = (sequelize, Sequelize) => {
    const Slot = sequelize.define('Slot', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        BarberSessionId: {
          type: Sequelize.INTEGER,
          references: {
            model: "BarberSessions", // Use the table name here
            key: "id",
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
          },
          allowNull: false, // Ensure it's not null unless optional
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        SalonId: {
          type: Sequelize.INTEGER,
          references: {
            model: "Salons", // Use the table name here
            key: "id",
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
          },
          allowNull: false,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        ServiceId: {
          type: Sequelize.INTEGER,
          references: {
            model: "Services", // Use the table name here
            key: "id",
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
          },
          allowNull: true, // Optional if slots don’t always need a service
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        slot_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        start_time: {
          type: Sequelize.TIME,
          allowNull: false,
        },
        end_time: {
          type: Sequelize.TIME,
          allowNull: false,
        },
        is_booked: {
          type: Sequelize.BOOLEAN,
          defaultValue: false, // Slots are usually not booked initially
        },
      },
      {
        timestamps: true, // Adds createdAt and updatedAt
      }
    );
  
    // Associations (should ideally be defined in the main index.js)
     // Import associated models
  const BarberSession = require("./barbersession.model")(sequelize, Sequelize);
  const Service = require("./service.model")(sequelize, Sequelize);
  const Salon = require("./salon.model")(sequelize, Sequelize);

  // Direct associations
  Slot.belongsTo(BarberSession, { 
    foreignKey: 'BarberSessionId', 
    as: 'barberSession',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });

  Slot.belongsTo(Service, { 
    foreignKey: 'ServiceId', 
    as: 'service',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });

  Slot.belongsTo(Salon, { 
    foreignKey: 'SalonId', 
    as: 'salon',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });

  
    return Slot;
  };
  