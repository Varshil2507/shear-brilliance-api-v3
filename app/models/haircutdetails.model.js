module.exports = (sequelize, Sequelize) => {
    const HaircutDetails = sequelize.define("HaircutDetails", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        AppointmentId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Appointments', // Correct table name
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        UserId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // Correct table name
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        customer_notes: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        haircut_style: {
            type: Sequelize.STRING,
            allowNull: true
        },
        product_used: {
            type: Sequelize.STRING,
            allowNull: true
        },
        barber_notes: {
            type: Sequelize.TEXT,
            allowNull: true
        }
    });

    // Define associations
    const Appointment = require("./appointments.model")(sequelize, Sequelize);
    HaircutDetails.belongsTo(Appointment, { foreignKey: 'AppointmentId', as: 'appointment', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

    const User = require("./user.model")(sequelize, Sequelize);
    HaircutDetails.belongsTo(User, { foreignKey: 'UserId', as: 'user', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

    return HaircutDetails;
};
