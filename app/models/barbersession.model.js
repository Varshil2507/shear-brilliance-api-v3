module.exports = (sequelize, Sequelize) => {
    const BarberSession = sequelize.define("BarberSession", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        BarberId: { // Foreign key for Barber ID
            type: Sequelize.INTEGER,
            references: {
                model: require("./barber.model")(sequelize, Sequelize),
                key: 'id',
                deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        SalonId: { // Foreign key for Salon ID
            type: Sequelize.INTEGER,
            references: {
                model: require("./salon.model")(sequelize, Sequelize),
                key: 'id',
                deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        start_time: {
            type: Sequelize.TIME,
            allowNull: false
        },
        end_time: {
            type: Sequelize.TIME,
            allowNull: false
        },
        remaining_time: {
            type: Sequelize.INTEGER, // time in minutes
            allowNull: false
        },
        session_date: { // Updated to store date and time
            type: Sequelize.DATEONLY,
            allowNull: true
        },
        category: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                isIn: [[1, 2]], // Matches Barber model
            },
        },
        position: {
            type: Sequelize.ENUM(
                'Senior',
                'Master',
                'Executive',
                'Braider',
                'Junior',
                'Trainee',
                'Student'
            ),
            allowNull: false,
            defaultValue: 'Junior',
        },        
    }, {
        timestamps: true, // Enable timestamps
    });

    // Define relationships
    const Barber = require("./barber.model")(sequelize, Sequelize);

    BarberSession.belongsTo(Barber, { 
        foreignKey: 'BarberId', 
        as: 'barber',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    });

    return BarberSession;
};
