module.exports = (sequelize, Sequelize) => {
    const BarberService = sequelize.define("BarberService", {
        BarberId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "Barbers",
                key: 'id',
                deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        ServiceId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Services',
                key: 'id',
                deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        SalonId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Salons',
                key: 'id',
                deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        price: {
            type: Sequelize.DECIMAL(10, 2), // 10 digits total, 2 after the decimal point
            allowNull: false,
        }
    });

    //   Define relationships
    const Barber = require("./barber.model")(sequelize, Sequelize);
    const Service = require("./service.model")(sequelize, Sequelize);
    const Salon = require("./salon.model")(sequelize, Sequelize);

    BarberService.belongsTo(Barber, {
        foreignKey: 'BarberId',
        as: 'barbers',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    });

    BarberService.belongsTo(Service, {
        foreignKey: 'ServiceId',
        as: 'service',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    });

    BarberService.belongsTo(Salon, {
        foreignKey: 'SalonId',
        as: 'salon',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    });

    return BarberService;
};