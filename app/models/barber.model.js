module.exports = (sequelize, Sequelize) => {
    const Barber = sequelize.define("Barber", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        availability_status: {
            type: Sequelize.ENUM('available', 'unavailable'),
            allowNull: false,
            validate: {
                isIn: [['available', 'unavailable']] // Add explicit validation
            }
        },
        weekly_schedule: {
            type: Sequelize.JSON,
            allowNull: true,
            defaultValue: {
                Monday: { start_time: '09:00', end_time: '22:00' },
                Tuesday: { start_time: '09:00', end_time: '18:00' },
                Wednesday: { start_time: '09:00', end_time: '17:00' },
                Thursday: { start_time: '09:00', end_time: '14:00' },
                Friday: { start_time: '09:00', end_time: '13:00' },
                Saturday: { start_time: '09:00', end_time: '15:00' },
                Sunday: { start_time: '09:00', end_time: '16:00' }
            },
            validate: {
                isValidSchedule(value) {
                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/;

                    for (const day of days) {
                        if (!value[day]) {
                            throw new Error(`Schedule must include ${day}`);
                        }
                        if (!value[day].start_time || !value[day].end_time) {
                            throw new Error(`${day} must have start_time and end_time`);
                        }
                        if (!timeFormat.test(value[day].start_time) || !timeFormat.test(value[day].end_time)) {
                            throw new Error(`Invalid time format for ${day}. Use HH:mm format (24-hour)`);
                        }
                    }
                }
            }
        },
        cutting_since: {
            type: Sequelize.DATE,
            allowNull: true
        },
        organization_join_date: {
            type: Sequelize.DATE,
            allowNull: true
        },
        photo: {
            type: Sequelize.STRING,
            allowNull: true
        }, 
        background_color: { // New field name
            type: Sequelize.STRING, // Hex or descriptive color value
            allowNull: true
        },    
        category: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1, // Default to '1' (ForAppointment)
            validate: {
                isIn: [[1, 2]] // Ensure only '1' or '2' is allowed
            }
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
            defaultValue: 'Junior'
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
        UserId: { // Foreign key for User ID
            type: Sequelize.INTEGER,
            references: {
                model: require("./user.model")(sequelize, Sequelize),
                key: 'id',
                deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        non_working_days: {
            type: Sequelize.ARRAY(Sequelize.INTEGER), // Store array of integers (1-7 representing days)
            allowNull: true
        },
    });

    // Define associations inside a function
    const Salon = require("./salon.model")(sequelize, Sequelize);
    const User = require("./user.model")(sequelize, Sequelize);

    Barber.belongsTo(Salon, { 
        foreignKey: 'SalonId', 
        as: 'salon',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    });
    Barber.belongsTo(User, { 
        foreignKey: 'UserId', 
        as: 'user',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    });

    Barber.associate = (models) => {
        Barber.belongsToMany(models.Service, { 
            through: models.BarberService,
            foreignKey: 'BarberId',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });
    };

     // Add afterUpdate Hook
     Barber.addHook('afterUpdate', async (barber, options) => {
        if (barber.changed('category') || barber.changed('position')) {
            const BarberSession = require("./barbersession.model")(sequelize, Sequelize);
            await BarberSession.update(
                {
                    category: barber.category,
                    position: barber.position,
                },
                { where: { BarberId: barber.id } }
            );
        }
    });

    return Barber;
};
