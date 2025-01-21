const express = require("express");
const transferAppointmentsOnBarberLeaveController = require('../controllers/transferAppointmentsOnBarberLeave.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { authenticateToken } = require('../middleware/authenticate.middleware');
const roles = require('../config/roles.config').role;

module.exports = (app) => {
    const apiPrefix = "/api/barber";
    /**
     * @swagger
     * tags:
     *   name: Transfer Appointments On Barber Leave
     *   description: Appointment management API
     */

    /**
 * @swagger
 * /api/barber/available-barbers/{appointmentId}:
 *   get:
 *     summary: Get a list of available barbers for transferring an appointment.
 *     tags:
 *       - Barber Appointments
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the appointment to transfer.
 *         example: 123
 *     responses:
 *       200:
 *         description: List of available barbers for the given appointment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Available barbers fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 123
 *                         date:
 *                           type: string
 *                           format: date
 *                           example: "2024-12-25"
 *                         startTime:
 *                           type: string
 *                           format: time
 *                           example: "10:00:00"
 *                         endTime:
 *                           type: string
 *                           format: time
 *                           example: "11:00:00"
 *                         services:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               name:
 *                                 type: string
 *                                 example: "Haircut"
 *                               duration:
 *                                 type: integer
 *                                 example: 30
 *                         currentBarber:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 5
 *                             category:
 *                               type: string
 *                               example: "Haircut"
 *                     availableBarbers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           category:
 *                             type: string
 *                             example: "Haircut"
 *                           availability_status:
 *                             type: string
 *                             example: "available"
 *                           profile_image:
 *                             type: string
 *                             example: "/images/barber-profile.jpg"
 *                           experience_years:
 *                             type: integer
 *                             example: 5
 *                           daySchedule:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 appointment_start_time:
 *                                   type: string
 *                                   format: time
 *                                   example: "09:00:00"
 *                                 appointment_end_time:
 *                                   type: string
 *                                   format: time
 *                                   example: "09:30:00"
 *       404:
 *         description: Appointment not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Appointment not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean 
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

    app.get(`${apiPrefix}/available-barbers/:appointmentId`,authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER), transferAppointmentsOnBarberLeaveController.getAvailableBarbers);

    /**
 * @swagger
 * /api/barber/transfer-appointments:
 *   post:
 *     summary: Transfer an appointment to another barber.
 *     tags:
 *       - Barber Appointments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId:
 *                 type: integer
 *                 description: The ID of the appointment to transfer.
 *                 example: 123
 *               newBarberId:
 *                 type: integer
 *                 description: The ID of the new barber.
 *                 example: 2
 *             required:
 *               - appointmentId
 *               - newBarberId
 *     responses:
 *       200:
 *         description: Appointment successfully transferred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Appointment successfully transferred."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Appointment ID.
 *                       example: 123
 *                     Barber:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 2
 *                         name:
 *                           type: string
 *                           example: "Jane Smith"
 *                         category:
 *                           type: string
 *                           example: "Haircut"
 *       400:
 *         description: Invalid input or barber unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Selected barber is no longer available for this time slot."
 *       404:
 *         description: Appointment not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Appointment not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */
    app.post(`${apiPrefix}/transfer-appointments`,authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER), transferAppointmentsOnBarberLeaveController.transferAppointment);
}