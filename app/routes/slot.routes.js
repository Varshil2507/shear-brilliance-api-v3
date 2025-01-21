const express = require("express");
const slotsController = require("../controllers/slot.controller");
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const roles = require('../config/roles.config').role;

module.exports = app => {
    const apiPrefix = "/api/slots";

 /**
 * @swagger
 * /api/slots/available:
 *   get:
 *     summary: Retrieve slots for a specific barber and date
 *     description: Fetch slots filtered by Barber ID and date. Includes both booked and unbooked slots, with booked slots marked as disabled for frontend use.
 *     tags:
 *       - Slots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: BarberId
 *         schema:
 *           type: integer
 *           example: 123
 *         required: true
 *         description: ID of the barber to filter slots.
 *       - in: query
 *         name: slot_date
 *         schema:
 *           type: string
 *           format: date
 *           example: 2024-12-01
 *         required: true
 *         description: Date to filter slots (YYYY-MM-DD format).
 *     responses:
 *       200:
 *         description: Successfully retrieved slots.
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
 *                   example: "Slots retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       session:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           BarberId:
 *                             type: integer
 *                           session_date:
 *                             type: string
 *                             format: date
 *                           start_time:
 *                             type: string
 *                             format: time
 *                           end_time:
 *                             type: string
 *                             format: time
 *                       slots:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             slot_date:
 *                               type: string
 *                               format: date
 *                             start_time:
 *                               type: string
 *                               format: time
 *                             end_time:
 *                               type: string
 *                               format: time
 *                             is_booked:
 *                               type: boolean
 *                             is_disabled:
 *                               type: boolean
 *                               description: Indicates whether the slot should be disabled for frontend use.
 *       400:
 *         description: Bad request, missing or invalid parameters.
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
 *                   example: "BarberId and slot_date are required."
 *                 data:
 *                   type: null
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
 *                   example: "An error occurred while retrieving slots."
 *                 data:
 *                   type: null
 */
    app.get(`${apiPrefix}/available`,authenticateJWT, slotsController.getAvailableSlots);
};