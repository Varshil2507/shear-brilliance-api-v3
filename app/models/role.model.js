module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define("Roles", {
        id: {
            type: Sequelize.UUID, // Change type to UUID
            defaultValue: Sequelize.UUIDV4, // Auto-generate UUIDs
            primaryKey: true
        },
        role_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true
        },
        can_create_appointment: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        can_modify_appointment: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        can_cancel_appointment: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        can_view_customers: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        can_manage_staff: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        can_manage_services: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        can_access_reports: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true // This will automatically add createdAt and updatedAt fields
    });

    return Role;
};
