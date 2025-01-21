module.exports = (sequelize, Sequelize) => {
    const Service = sequelize.define("Service", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: { // New description field
            type: Sequelize.STRING,
            allowNull: true, // Allowing it to be null, you can set it to false if required
        },
        default_service_time: { // Changed from estimate_wait_time to default_service_time
            type: Sequelize.INTEGER, // Assuming this is in minutes
            allowNull: false,
        },
        min_price: { // Newly added field
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        max_price: { // Newly added field
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true, // Default value is active
        },
    }, {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    });

    return Service;
};
