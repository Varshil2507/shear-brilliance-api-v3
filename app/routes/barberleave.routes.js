const barberLeaveController = require('../controllers/barberLeave.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const roles = require('../config/roles.config').role;


module.exports = app => {
    // API Prefix for barber leave
    const apiPrefix = "/api/barber-leave";

 /**
     * @swagger
     * components:
     *   schemas:
     *     LeaveRequest:
     *       type: object
     *       required:
     *         - availability_status
     *         - start_date
     *         - end_date
     *         - reason
     *       properties:
     *         availability_status:
     *           type: string
     *           enum:
     *             - available
     *             - unavailable
     *           description: Availability status of the barber
     *         start_date:
     *           type: string
     *           format: date
     *           description: The start date of the leave
     *         end_date:
     *           type: string
     *           format: date
     *           description: The end date of the leave
     *         start_time:
     *           type: string
     *           format: time
     *           description: Start time of the leave (only required if availability_status is 'available')
     *         end_time:
     *           type: string
     *           format: time
     *           description: End time of the leave (only required if availability_status is 'available')
     *         reason:
     *           type: string
     *           enum:
     *             - personal
     *             - sick
     *             - family_emergency
     *             - vacation
     *             - training
     *             - child_care
     *             - maternity_leave
     *             - bereavement
     *             - appointment
     *             - other
     *           description: Reason for the leave
     *       example:
     *         availability_status: "available"
     *         start_date: "2024-12-25"
     *         end_date: "2024-12-30"
     *         start_time: "09:00"
     *         end_time: "17:00"
     *         reason: "vacation"
     */

    /**
     * @swagger
     * /api/barber-leave/create:
     *   post:
     *     summary: Create a leave request for a barber
     *     tags: [BarberLeave]
     *     security:
     *       - bearerAuth: [] # Use bearerAuth for token-based authentication
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LeaveRequest'
     *     responses:
     *       201:
     *         description: Leave request created successfully
     *       400:
     *         description: Bad request (missing required fields or invalid input)
     *       401:
     *         description: Unauthorized (missing or invalid token)
     *       500:
     *         description: Server error
     */

    app.post(`${apiPrefix}/create`, authenticateJWT, barberLeaveController.createLeave);

/**
 * @swagger
 * /api/barber-leave/barber:
 *   get:
 *     summary: Get all leave requests for the logged-in barber, optionally filtered by date range, status, or search query
 *     tags: [BarberLeave]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: false
 *         description: "Start date to filter leaves (format: YYYY-MM-DD). If not provided, leaves from any date will be fetched."
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         required: false
 *         description: "End date to filter leaves (format: YYYY-MM-DD). If not provided, leaves up to any date will be fetched."
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         required: false
 *         description: "The status of the leave to filter (e.g., 'approved', 'pending', 'denied')."
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         required: false
 *         description: "Search query to filter by barber name."
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         description: "The page number for pagination (default is 1)."
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         required: false
 *         description: "The number of items per page for pagination (default is 10)."
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leave requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                 message:
 *                   type: string
 *                   description: A message about the operation result
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaves:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Leave ID
 *                           BarberId:
 *                             type: integer
 *                             description: ID of the barber
 *                           date:
 *                             type: string
 *                             format: date
 *                             description: Date of the leave
 *                           status:
 *                             type: string
 *                             description: Status of the leave (e.g., 'approved', 'pending', 'denied')
 *                           barber:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 description: Barber ID
 *                               name:
 *                                 type: string
 *                                 description: Barber name
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           description: The current page number
 *                         totalPages:
 *                           type: integer
 *                           description: The total number of pages
 *                         totalItems:
 *                           type: integer
 *                           description: The total number of leave requests
 *                         itemsPerPage:
 *                           type: integer
 *                           description: The number of items per page
 *       400:
 *         description: Bad request (e.g., invalid date format)
 *       401:
 *         description: Unauthorized (e.g., missing or invalid token)
 *       500:
 *         description: Server error
 */

app.get(`${apiPrefix}/barber`, authenticateJWT, barberLeaveController.getLeavesByBarber);


/**
 * @swagger
 * /api/barber-leave/all:
 *   get:
 *     summary: Get all leave requests for all barbers, optionally filtered by a date range and status
 *     tags: 
 *       - BarberLeave
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: false
 *         description: "The start date to filter leave requests (format: YYYY-MM-DD)."
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         required: false
 *         description: "The end date to filter leave requests (format: YYYY-MM-DD)."
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         required: false
 *         description: "The status to filter leaves. Allowed values are 'approved', 'pending', 'denied'. If not provided, all statuses are included."
 *         schema:
 *           type: string
 *           enum: [approved, pending, denied]
 *       - in: query
 *         name: search
 *         required: false
 *         description: "Search term to filter barbers by name."
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         description: "Page number for pagination. Default is 1."
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         required: false
 *         description: "Number of leave requests per page. Default is 10."
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of leave requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful
 *                 message:
 *                   type: string
 *                   description: Response message
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaves:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Leave ID
 *                           BarberId:
 *                             type: integer
 *                             description: ID of the barber
 *                           start_date:
 *                             type: string
 *                             format: date
 *                             description: Start date of the leave
 *                           end_date:
 *                             type: string
 *                             format: date
 *                             description: End date of the leave
 *                           status:
 *                             type: string
 *                             description: Status of the leave (approved, pending, denied)
 *                           Barber:
 *                             type: object
 *                             description: Barber details
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 description: Barber ID
 *                               name:
 *                                 type: string
 *                                 description: Barber name
 *                               Salon:
 *                                 type: object
 *                                 description: Salon details
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                     description: Salon ID
 *                                   name:
 *                                     type: string
 *                                     description: Salon name
 *                               User:
 *                                 type: object
 *                                 description: User details
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                     description: User ID
 *                                   name:
 *                                     type: string
 *                                     description: User name
 *                           appointments:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   description: Appointment ID
 *                                 appointment_date:
 *                                   type: string
 *                                   format: date
 *                                   description: Date of the appointment
 *                                 status:
 *                                   type: string
 *                                   description: Status of the appointment
 *                                 SlotId:
 *                                   type: integer
 *                                   description: Slot ID for the appointment
 *                                 slot_start_time:
 *                                   type: string
 *                                   description: Start time of the appointment slot
 *                                 slot_end_time:
 *                                   type: string
 *                                   description: End time of the appointment slot
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           description: Current page number
 *                         totalItems:
 *                           type: integer
 *                           description: Total number of leave requests
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages
 *       400:
 *         description: Invalid date format or invalid status value
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
 *                   example: Invalid date format or status value.
 *                 data:
 *                   type: null
 *       500:
 *         description: Server error
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
 *                   example: An unexpected error occurred while fetching all leave requests.
 *                 data:
 *                   type: null
 */


app.get(`${apiPrefix}/all`,  authenticateJWT, authorizeRoles(roles.ADMIN,roles.SALON_MANAGER), barberLeaveController.getAllLeaves);

 /**
 * @swagger
 * /api/barber-leave/status/{id}:
 *   put:
 *     summary: Update the status of a barber's leave request
 *     tags: [BarberLeave]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the leave request
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: New status of the leave request (approved or denied)
 *                 enum: [approved, denied]
 *               response_reason:
 *                 type: string
 *                 description: Reason for denial (required if status is 'denied')
 *               start_time:
 *                 type: string
 *                 format: time
 *                 description: Start time for availability status (required if availability_status is 'available')
 *               end_time:
 *                 type: string
 *                 format: time
 *                 description: End time for availability status (required if availability_status is 'available')
 *             example:
 *               status: "denied"
 *               response_reason: "Insufficient staff coverage"
 *     responses:
 *       200:
 *         description: Leave status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                 code:
 *                   type: integer
 *             example:
 *               success: true
 *               message: "Leave status updated to denied."
 *               data:
 *                 id: 1
 *                 status: "denied"
 *                 response_reason: "Insufficient staff coverage"
 *               code: 200
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 code:
 *                   type: integer
 *             example:
 *               success: false
 *               message: "Response reason is required when status is denied."
 *               code: 400
 *       403:
 *         description: Unauthorized action
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 code:
 *                   type: integer
 *             example:
 *               success: false
 *               message: "Unauthorized. Only salon managers can update leave status."
 *               code: 403
 *       404:
 *         description: Leave request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 code:
 *                   type: integer
 *             example:
 *               success: false
 *               message: "Leave request not found."
 *               code: 404
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 code:
 *                   type: integer
 *             example:
 *               success: false
 *               message: "An error occurred while updating the leave status."
 *               code: 500
 */
    app.put(`${apiPrefix}/status/:id`, authenticateJWT, authorizeRoles(roles.ADMIN,roles.SALON_MANAGER), barberLeaveController.updateLeaveStatus);

};
