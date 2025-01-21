const cron = require('node-cron');
const { Appointment } = require('../models');
const { Op } = require('sequelize');
const db = require('../models');
const Barber = db.Barber;
const User =db.USER;
const FcmToken = db.fcmTokens;
const { sendMessageToUser } = require('./socket.controller');
const { broadcastBoardUpdates, insalonCustomerUpdates } = require('../controllers/socket.controller');
const { getAppointmentsByRoleExp, getInSalonAppointmentsByRoleExp } = require('./appointments.controller');
const { AppointmentENUM } = require('../config/appointment.config');
const { sendNotificationToUser } = require('../services/notificationService'); // Replace with your notification function path

exports.cronController = () => {
    cron.schedule('*/1 * * * *', async () => {
        try {
            console.log('Cron job started: Updating wait times and broadcasting updates...');

            // Fetch appointments for today
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            let appointments = await Appointment.findAll({
                where: {
                    status: [AppointmentENUM.In_salon, AppointmentENUM.Checked_in],
                    createdAt: {
                        [Op.between]: [startOfDay, endOfDay],
                    },
                },
                include: [
                    {
                        model: Barber,
                        as: 'Barber',
                    },
                ],
                order: [['queue_position', 'ASC']], // Order by queue position
            });


            if (appointments.length === 0) {
                console.log('No active appointments found.');
                return;
            }

            // Process `in_salon` users and update estimated wait times for `checked_in` users
            const currentUsers = appointments.filter((app) => app.status === 'in_salon');

            currentUsers.forEach((currentUser) => {
                const barberId = currentUser.BarberId;

                // Get all `checked_in` appointments for the same barber
                const checkInAppointments = appointments.filter(
                    (app) => app.status === 'checked_in' && app.BarberId === barberId
                );

                checkInAppointments.forEach(async (checkInAppointment) => {
                    if (checkInAppointment.estimated_wait_time <= 0) {
                        // Mark appointment as completed if wait time is 0
                        currentUser.status = 'completed';
                        await currentUser.save();

                        console.log(`User ${currentUser.id} completed for Barber ${barberId}`);
                    } else {
                        // Reduce wait time for the `checked_in` user
                        checkInAppointment.estimated_wait_time = Math.max(checkInAppointment.estimated_wait_time - 1, 0);
                        await checkInAppointment.save();

                        // Send updates to individual users
                        sendMessageToUser(
                            checkInAppointment.UserId,
                            'waitTimeUpdate',
                            checkInAppointment
                        );

                        console.log(
                            `Barber ${barberId} | User ${checkInAppointment.id} | New estimated wait time: ${checkInAppointment.estimated_wait_time} minutes.`
                        );
                    }
                });
            });

            const updatedAppointments = await getAppointmentsByRoleExp(false);
            appointments = updatedAppointments;
            broadcastBoardUpdates(appointments);

            // Filter appointments to include only those with status "in_salon"
            const inSalonAppointments = updatedAppointments.filter(
                (appointment) => appointment.status == AppointmentENUM.In_salon
            );
            insalonCustomerUpdates(inSalonAppointments);

            console.log('Cron job completed.');
        } catch (error) {
            console.error('Error in cron job:', error.message);
        }
    });
    
    cron.schedule('*/10 * * * *', async () => {
        try {
            console.log('Cron job started: Checking estimated wait time of 10 minutes.');


            // Fetch appointments for today
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            let appointments = await Appointment.findAll({
                where: {
                    estimated_wait_time: {
                        [Op.between]: [5, 10], // Between 5 and 10 minutes
                    },
                    status: [AppointmentENUM.Checked_in],
                    createdAt: {
                        [Op.between]: [startOfDay, endOfDay],
                    },
                },
                include: [
                    {
                        model: Barber,
                        as: 'Barber',
                    },
                ],
                order: [['queue_position', 'ASC']],
            });

            if (appointments.length === 0) {
                console.log('No appointments with estimated wait time of 10 minutes.');
                return;
            }

            // Send notifications
            for (const appointment of appointments) {
                const user_id = appointment.UserId; // Assuming UserId is available in the table
                const salonName = 'Your Salon'; // Replace with dynamic data if available

                // Fetch FCM tokens
                const fcmTokens = await FcmToken.findAll({ where: { UserId: user_id } });

                if (fcmTokens.length > 0) {
                    const notificationTitle = 'Appointment Reminder';
                    const notificationBody = `Your estimated wait time at ${salonName} is 10 minutes.`;

                    for (const token of fcmTokens) {
                        await sendNotificationToUser(token.token, notificationTitle, notificationBody);
                    }

                    console.log(`Notification sent to user ${user_id}`);
                } else {
                    console.log(`No FCM tokens found for user ${user_id}`);
                }
            }

            console.log('Cron job completed.');
        } catch (error) {
            console.error('Error in cron job:', error.message);
        }
    });

    cron.schedule('0 8 * * *', async () => { // Runs at 8 AM every day
        try {
            console.log('Daily appointment reminder cron job started');
    
            // Get today's date
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
    
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
    
            // Fetch all appointments for today
            let appointments = await Appointment.findAll({
                where: {
                    appointment_date: {
                        [Op.between]: [startOfDay, endOfDay],
                    },
                    status: [AppointmentENUM.Appointment], // Add relevant status
                },
                include: [
                    {
                        model: Barber,
                        as: 'Barber',
                    },
                    {
                        model: User,
                        as: 'User',
                    }
                ],
            });
    
            if (appointments.length === 0) {
                console.log('No appointments scheduled for today.');
                return;
            }
    
            // Send notifications for each appointment
            for (const appointment of appointments) {
                const user_id = appointment.UserId;
                const barber = await db.Barber.findByPk(appointment.BarberId);
                
                const salon = await db.Salon.findOne({ where: { id: barber.SalonId } });
                const salonName = salon ? salon.name : 'the selected salon';
                
                // appointment time
                const appointmentTime = appointment.appointment_date;
    
                // Fetch FCM tokens
                const fcmTokens = await FcmToken.findAll({ where: { UserId: user_id } });
    
                if (fcmTokens.length > 0) {
                    const notificationTitle = 'Today\'s Appointment Reminder';
                    const notificationBody = `You have an appointment today at ${appointmentTime} at ${salonName} with ${appointment.Barber.name}.`;
    
    
                    for (const token of fcmTokens) {
                        await sendNotificationToUser(token.token, notificationTitle, notificationBody );
                    }
    
                    console.log(`Daily reminder notification sent to user ${user_id}`);
                } else {
                    console.log(`No FCM tokens found for user ${user_id}`);
                }
            }
    
            console.log('Daily appointment reminder cron job completed.');
        } catch (error) {
            console.error('Error in daily reminder cron job:', error.message);
        }
    });
};
