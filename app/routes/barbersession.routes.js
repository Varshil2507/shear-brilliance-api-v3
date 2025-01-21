const express = require("express");
const barberSessionsController = require('../controllers/barbersession.contoller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { authenticateToken } = require('../middleware/authenticate.middleware');
const { role } = require("../config/roles.config");

module.exports = (app) => {
    const apiPrefix = "/api/barber-sessions";

   /**
   * @swagger
   * tags:
   *   name: BarberSessions
   *   description: Barber session management API
   */

/**
 * @swagger
 * /api/barber-sessions/create:
 *   post:
 *     summary: Create barber sessions for a barber in a salon
 *     tags: [BarberSessions]
 *     security:
 *       - bearerAuth: []  # Assuming you use bearer token authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - BarberId
 *               - SalonId
 *               - availableDays
 *             properties:
 *               BarberId:
 *                 type: integer
 *                 description: ID of the barber for whom the sessions are being created
 *                 example: 5
 *               SalonId:
 *                 type: integer
 *                 description: ID of the salon where the barber is available
 *                 example: 10
 *               availableDays:
 *                 type: array
 *                 description: Array of available days with session details
 *                 items:
 *                   type: object
 *                   required:
 *                     - date
 *                     - startTime
 *                     - endTime
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                       description: Date of the session in YYYY-MM-DD format
 *                       example: "2024-12-25"
 *                     startTime:
 *                       type: string
 *                       format: time
 *                       description: Start time of the session in HH:mm format
 *                       example: "09:00"
 *                     endTime:
 *                       type: string
 *                       format: time
 *                       description: End time of the session in HH:mm format
 *                       example: "17:00"
 *     responses:
 *       201:
 *         description: Barber sessions created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Barber sessions created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     barber:
 *                       type: object
 *                       description: Details of the barber
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 5
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         availability_status:
 *                           type: string
 *                           example: "Available"
 *                         default_service_time:
 *                           type: integer
 *                           example: 30
 *                         cutting_since:
 *                           type: string
 *                           format: date
 *                           example: "2015-05-15"
 *                         organization_join_date:
 *                           type: string
 *                           format: date
 *                           example: "2020-01-01"
 *                         photo:
 *                           type: string
 *                           example: "https://example.com/photo.jpg"
 *                     salon:
 *                       type: object
 *                       description: Details of the salon
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 10
 *                         name:
 *                           type: string
 *                           example: "Shear Brilliance Salon"
 *                         address:
 *                           type: string
 *                           example: "123 Main Street"
 *                         phone_number:
 *                           type: string
 *                           example: "+1234567890"
 *                         open_time:
 *                           type: string
 *                           format: time
 *                           example: "09:00"
 *                         close_time:
 *                           type: string
 *                           format: time
 *                           example: "21:00"
 *                     groupedSessions:
 *                       type: array
 *                       description: Grouped barber sessions by week
 *                       items:
 *                         type: object
 *                         properties:
 *                           salonName:
 *                             type: string
 *                             example: "Shear Brilliance Salon"
 *                           barberName:
 *                             type: string
 *                             example: "John Doe"
 *                           schedule:
 *                             type: array
 *                             description: Weekly schedule of sessions
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 1
 *                                 day:
 *                                   type: string
 *                                   description: Day of the week
 *                                   example: "Monday"
 *                                 date:
 *                                   type: string
 *                                   format: date
 *                                   description: Date of the session
 *                                   example: "2024-12-25"
 *                                 startTime:
 *                                   type: string
 *                                   format: time
 *                                   description: Start time of the session
 *                                   example: "09:00"
 *                                 endTime:
 *                                   type: string
 *                                   format: time
 *                                   description: End time of the session
 *                                   example: "17:00"
 *       400:
 *         description: Bad request - Invalid or missing fields
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
 *                   example: "End time must be after start time for the date 2024-12-25"
 *                 code:
 *                   type: integer
 *                   example: 400
 *       500:
 *         description: Internal server error
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
 *                   example: "An error occurred while creating barber sessions"
 *                 code:
 *                   type: integer
 *                   example: 500
 */


   // Create a new barber session
    app.post(`${apiPrefix}/create`, authenticateToken, authorizeRoles(role.ADMIN, role.SALON_MANAGER), barberSessionsController.create);


/**
 * @swagger
 * /api/barber-sessions:
 *   get:
 *     summary: Retrieve barber sessions based on filters like SalonId, BarberId, category, and date
 *     tags: [BarberSessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: SalonId
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID of the salon to filter barber sessions by
 *         example: 10
 *       - in: query
 *         name: BarberId
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID of the barber to filter barber sessions by
 *         example: 5
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *           enum: [1, 2]
 *         required: false
 *         description: "Category of the session: 1 for Appointment, 2 for Checkin"
 *         example: 1
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           pattern: '^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-([0-9]{4})$'
 *         required: false
 *         description: Date in DD-MM-YYYY format. Returns sessions from this date to the same date next month
 *         example: "15-12-2024"
 *     responses:
 *       200:
 *         description: Barber sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Barber sessions retrieved successfully for 15/12/2024 to 15/01/2025"
 *                 data:
 *                   type: array
 *                   description: Grouped salon and barber data
 *                   items:
 *                     type: object
 *                     properties:
 *                       salon:
 *                         type: object
 *                         description: Details about the salon
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 10
 *                           name:
 *                             type: string
 *                             example: "Modern Cuts"
 *                           address:
 *                             type: string
 *                             example: "123 Main Street, Cityville"
 *                           phone_number:
 *                             type: string
 *                             example: "+1-555-123-4567"
 *                           open_time:
 *                             type: string
 *                             format: time
 *                             example: "09:00"
 *                           close_time:
 *                             type: string
 *                             format: time
 *                             example: "21:00"
 *                       barbers:
 *                         type: array
 *                         description: List of barbers working at this salon
 *                         items:
 *                           type: object
 *                           properties:
 *                             barber:
 *                               type: object
 *                               description: Details about the barber
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 5
 *                                 name:
 *                                   type: string
 *                                   example: "John Doe"
 *                                 availability_status:
 *                                   type: string
 *                                   example: "Available"
 *                                 default_service_time:
 *                                   type: integer
 *                                   example: 30
 *                                 cutting_since:
 *                                   type: string
 *                                   format: date
 *                                   example: "2015-06-15"
 *                                 organization_join_date:
 *                                   type: string
 *                                   format: date
 *                                   example: "2020-01-01"
 *                                 photo:
 *                                   type: string
 *                                   format: uri
 *                                   example: "https://example.com/photos/john-doe.jpg"
 *                                 category:
 *                                   type: string
 *                                   description: Category of barber (e.g., stylist, barber)
 *                                   example: "Stylist"
 *                                 position:
 *                                   type: string
 *                                   description: Position or role of the barber
 *                                   example: "Senior Barber"
 *                                 schedule:
 *                                   type: array
 *                                   description: List of sessions for this barber
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       id:
 *                                         type: integer
 *                                         example: 101
 *                                       day:
 *                                         type: string
 *                                         description: Day of the week
 *                                         example: "Monday"
 *                                       date:
 *                                         type: string
 *                                         format: date
 *                                         description: Date of the session
 *                                         example: "2024-12-18"
 *                                       startTime:
 *                                         type: string
 *                                         format: time
 *                                         description: Start time of the session
 *                                         example: "09:00"
 *                                       endTime:
 *                                         type: string
 *                                         format: time
 *                                         description: End time of the session
 *                                         example: "17:00"
 *       404:
 *         description: No barber sessions found for the provided filters
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
 *                   example: "No barber sessions found for the selected date range"
 *       500:
 *         description: Internal server error
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
 *                   example: "An error occurred while retrieving barber sessions"
 */

// Get all barber sessions (filtered by date range, optionally filtered by BarberId)
app.get(
  `${apiPrefix}/`,
  authenticateToken,
  authorizeRoles(role.ADMIN, role.BARBER, role.SALON_MANAGER, role.SALON_OWNER, role.CUSTOMER),
  barberSessionsController.getAll
);


/**
 * @swagger
 * /api/barber-sessions/{id}:
 *   put:
 *     summary: Update or delete a barber session based on availability and time changes
 *     tags: [BarberSessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the barber session to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               BarberId:
 *                 type: integer
 *                 description: ID of the barber
 *               SalonId:
 *                 type: integer
 *                 description: ID of the salon
 *               start_time:
 *                 type: string
 *                 format: time
 *                 description: Start time of the session (in HH:mm format)
 *               end_time:
 *                 type: string
 *                 format: time
 *                 description: End time of the session (in HH:mm format)
 *               session_date:
 *                 type: string
 *                 format: date
 *                 description: Date of the barber session (in YYYY-MM-DD format)
 *               availability_status:
 *                 type: string
 *                 enum: [available, unavailable]
 *                 description: Availability status of the barber. If 'unavailable', the session will be removed and a leave recorded.
 *               reason:
 *                 type: string
 *                 description: Reason for the leave if the session is unavailable. If the session is today, this can be set to null.
 *     responses:
 *       200:
 *         description: Barber session updated or removed successfully
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
 *                   example: "Barber session updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     BarberId:
 *                       type: integer
 *                       example: 1
 *                     SalonId:
 *                       type: integer
 *                       example: 5
 *                     start_time:
 *                       type: string
 *                       example: "09:00"
 *                     end_time:
 *                       type: string
 *                       example: "12:00"
 *                     remaining_time:
 *                       type: integer
 *                       description: Remaining time in minutes
 *                       example: 180
 *       400:
 *         description: Invalid input, e.g., missing required fields or invalid times
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
 *                   example: "Barber session ID is required"
 *                 data:
 *                   type: null
 *       404:
 *         description: Barber session not found
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
 *                   example: "Barber session not found"
 *                 data:
 *                   type: null
 *       500:
 *         description: Internal server error
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
 *                   example: "An error occurred while updating the barber session"
 *                 data:
 *                   type: null
 */


    // Update an existing barber session
    app.put(`${apiPrefix}/:id`, authenticateToken, authorizeRoles(role.ADMIN, role.SALON_MANAGER ), barberSessionsController.update);

    /**
     * @swagger
     * /api/barber-sessions/{id}:
     *   delete:
     *     summary: Delete an existing barber session
     *     tags: [BarberSessions]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID of the barber session to be deleted
     *     responses:
     *       200:
     *         description: Barber session deleted successfully
     *       404:
     *         description: Barber session not found
     *       500:
     *         description: Internal server error
     */
        // Delete a barber session
    app.delete(`${apiPrefix}/:id`, authenticateToken, authorizeRoles(role.ADMIN, role.SALON_MANAGER), barberSessionsController.delete);

    /**
     * @swagger
     * /api/barber-sessions/barber/{BarberId}:
     *   post:
     *     summary: Get barber sessions by BarberId and service time
     *     tags: [BarberSessions]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               BarberId:
     *                 type: integer
     *                 description: ID of the barber to filter sessions by
     *               service_time:
     *                 type: integer
     *                 description: The minimum service time required for booking the session (in minutes)
     *                 example: 30
     *     responses:
     *       200:
     *         description: Barber sessions retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 sessions:
     *                   type: array
     *                   items:
     *                     type: object
     *                     description: Barber session data with availability check
     *                     properties:
     *                       id:
     *                         type: integer
     *                         description: ID of the session
     *                       start_time:
     *                         type: string
     *                         format: date-time
     *                         description: Start time of the session
     *                       remaining_time:
     *                         type: integer
     *                         description: Remaining time available in the session (in minutes)
     *                       isFullyBooked:
     *                         type: boolean
     *                         description: Indicates if the session is fully booked
     *                       isAvailableForWalkIn:
     *                         type: boolean
     *                         description: Indicates if the session has enough remaining time for the requested service
     *                       service_time:
     *                         type: integer
     *                         description: The requested minimum service time
     *       400:
     *         description: Invalid input data (e.g., missing or invalid BarberId or service_time)
     *       404:
     *         description: Barber sessions not found for the specified BarberId
     *       500:
     *         description: Internal server error
     */
    app.post(`${apiPrefix}/barber/:BarberId`, authenticateToken, authorizeRoles(role.ADMIN, role.SALON_OWNER, role.SALON_MANAGER, role.BARBER,role.CUSTOMER), barberSessionsController.findByBarberId);
};
