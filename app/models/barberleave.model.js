module.exports = (sequelize, Sequelize) => {
    const BarberLeave = sequelize.define('BarberLeave', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      BarberId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Barbers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      start_date: { // Start date for the leave range
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: { // End date for the leave range
        type: Sequelize.DATE,
        allowNull: false
      },
      start_time: { // Leave start time (clock-based)
        type: Sequelize.TIME,
        allowNull: true
      },
      end_time: { // Leave end time (clock-based)
        type: Sequelize.TIME,
        allowNull: true
      },
      reason: {
        type: Sequelize.ENUM(
          'personal',
          'sick',
          'family_emergency',
          'vacation',
          'training',
          'child_care',
          'maternity_leave',
          'bereavement',
          'appointment',
          'other'
        ),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'denied'),
        defaultValue: 'pending',
        allowNull: false
      },
      availability_status: { // New field added
        type: Sequelize.ENUM('available', 'unavailable'),
        defaultValue: 'available',
        allowNull: false
      },
      approve_by_id: { // New field
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'Users', // Assuming Users is the table for admins/managers
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    response_reason: { // New field
        type: Sequelize.TEXT,
        allowNull: true
    }
    });
  

    const Barber = require("./barber.model")(sequelize, Sequelize);

    BarberLeave.belongsTo(Barber, { 
        foreignKey: 'BarberId', 
        as: 'barber',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    
  
    return BarberLeave;
  };
  