const jwt = require('jsonwebtoken'); // JWT for authentication
const db = require("../models");
const User = db.USER; // Your User model
const secretKey = require('../config/jwt.config').secret;
const { role } = require('../config/roles.config');

// Map for storing user-to-socket relationships
const userSockets = new Map();

let io; // Global Socket.IO instance

// Initialize the Socket.IO instance
const initialize = (socketIo) => {
    io = socketIo;
};

// Main socket controller
const socketController = () => {
    io.on('connection', (socket) => {
        console.log('A user connected');

        // Extract the JWT token
        const token = socket.handshake.query.token || socket.handshake.headers['authorization'];

        if (!token) {
            console.log('No token provided, disconnecting socket');
            socket.disconnect();
            return;
        }

        // Verify and decode the JWT token
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                console.log('Invalid token', err);
                socket.disconnect();
                return;
            }

            const userId = decoded.id;
            
            console.log(`User ${userId}`);

            // Optionally fetch user from the database
            const user = await User.findByPk(userId);

            if (!user) {
                console.log('User not found');
                socket.disconnect();
                return;
            }

            // Associate socket ID with user ID
            userSockets.set(user.id, socket.id);
            console.log(`User ${user.id} connected with socket ID ${socket.id}`);

            let roleRoom = null;

                if (decoded.role === role.ADMIN) {
                    roleRoom = 'Admin';
                } else if (decoded.role === role.BARBER && decoded.barberId) {
                    console.log("Barber login")
                    roleRoom = `Barber_${decoded.barberId}`;
                } else if (decoded.role === role.SALON_OWNER && decoded.salonId) {
                    roleRoom = `Salon_${decoded.salonId}`;
                    console.log("Salon login")
                }


            if (roleRoom) {
                socket.join(roleRoom);
            }

            // Handle disconnect event
            socket.on('disconnect', () => {
                console.log(`User ${userId} disconnected`);
                userSockets.delete(userId); // Clean up
            });
        });
    });
};

const broadcastToRole = (roleName, event, data) => {
  if (io) {
      io.to(roleName).emit(event, data);
  }
};

// Send a message to a specific user by userId
const sendMessageToUser = (userId, event, data) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
        io.to(socketId).emit(event, data);
        console.log(`Sent '${event}' to user ${userId}`);
    } else {
        console.log(`User ${userId} is not connected.`);
    }
};

const broadcastBoardUpdates = async (updatedAppointments) => {
  broadcastToRole('Admin', 'updateBoard', updatedAppointments);

  const barberIds = [...new Set(updatedAppointments.map((app) => app.BarberId))];
  barberIds.forEach((barberId) => {
      const barberAppointments = updatedAppointments.filter((app) => app.BarberId === barberId);
      broadcastToRole(`Barber_${barberId}`, 'updateBoard', barberAppointments);
  });

  const salonIds = [...new Set(updatedAppointments.map((app) => app.SalonId))];
  salonIds.forEach((salonId) => {
      const salonAppointments = updatedAppointments.filter((app) => app.SalonId === salonId);
      broadcastToRole(`Salon_${salonId}`, 'updateBoard', salonAppointments);
  });
};


const insalonCustomerUpdates = async (updatedAppointments) => {
    broadcastToRole('Admin', 'insaloncustomerupdate', updatedAppointments);
  
    const barberIds = [...new Set(updatedAppointments.map((app) => app.BarberId))];
    barberIds.forEach((barberId) => {
        const barberAppointments = updatedAppointments.filter((app) => app.BarberId === barberId);
        broadcastToRole(`Barber_${barberId}`, 'insaloncustomerupdate', barberAppointments);
    });
  
    const salonIds = [...new Set(updatedAppointments.map((app) => app.SalonId))];
    salonIds.forEach((salonId) => {
        const salonAppointments = updatedAppointments.filter((app) => app.SalonId === salonId);
        broadcastToRole(`Salon_${salonId}`, 'insaloncustomerupdate', salonAppointments);
    });
  };

// Export the module
module.exports = {
    initialize,
    socketController,
    sendMessageToUser,
    broadcastToRole,
    broadcastBoardUpdates,
    insalonCustomerUpdates
};
