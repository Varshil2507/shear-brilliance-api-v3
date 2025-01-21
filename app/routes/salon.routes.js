const express = require("express");
const path = require("path");
const salonController = require("../controllers/salon.controller");
const upload = require('../config/multer.config'); // Import multer configuration
const { authenticateToken} = require('../middleware/authenticate.middleware'); // Adjust the path as needed
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const roles = require('../config/roles.config').role;

module.exports = app => {
  const apiPrefix = "/api/salon";

  /**
   * @swagger
   * tags:
   *   name: Salons
   *   description: Salon management API
   */

/**
 * @swagger
 * /api/salon:
 *   post:
 *     summary: Create a new salon with multiple photos upload
 *     tags: [Salons]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the salon
 *               firstname:
 *                 type: string
 *                 description: First name of the salon owner
 *               lastname:
 *                 type: string
 *                 description: Last name of the salon owner
 *               email:
 *                 type: string
 *                 description: Email address for the salon owner account
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the salon owner account
 *               address:
 *                 type: string
 *                 description: Address of the salon
 *               phone_number:
 *                 type: string
 *                 description: Contact number of the salon
 *               open_time:
 *                 type: string
 *                 description: Salon opening time
 *               close_time:
 *                 type: string
 *                 description: Salon closing time
 *               weekend_day:
 *                 type: boolean
 *                 description: Indicates if the salon operates on weekends
 *               weekend_start:
 *                 type: string
 *                 description: Weekend opening time (optional)
 *               weekend_end:
 *                 type: string
 *                 description: Weekend closing time (optional)
 *               status:
 *                 type: string
 *                 enum: [open, close]
 *                 description: status 
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload multiple photos (up to 5)
 *     responses:
 *       201:
 *         description: Salon created successfully
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
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: Details of the salon owner
 *                     salon:
 *                       type: object
 *                       description: Details of the created salon
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
  app.post(`${apiPrefix}`, upload.array('photos', 5), authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER),salonController.create);

  
  /**
   * @swagger
   * /api/salon:
   *   get:
   *     summary: Get a list of salons with optional filtering for favorites and search functionality
   *     description: Fetch all salons with options to filter by favorites, search by name or address, and view additional salon details.
   *     tags: Salons
   *     parameters:
   *       - in: query
   *         name: favorites
   *         schema:
   *           type: boolean
   *         required: false
   *         description: Include salons marked as favorites (true or false).
   *       - in: query
   *         name: onlyfavorites
   *         schema:
   *           type: boolean
   *         required: false
   *         description: If true, returns only salons that are marked as favorites by the user.
   *       - in: query
   *         name: searchName
   *         schema:
   *           type: string
   *         required: false
   *         description: Search salons by name or address.
   *     responses:
   *       200:
   *         description: Successfully fetched salons
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
   *                   example: "Salons fetched successfully"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       salon_id:
   *                         type: integer
   *                         description: The unique ID of the salon.
   *                         example: 1
   *                       salon_name:
   *                         type: string
   *                         description: The name of the salon.
   *                         example: "Elegant Cuts"
   *                       address:
   *                         type: string
   *                         description: The address of the salon.
   *                         example: "1234 Main St"
   *                       appointment_count:
   *                         type: integer
   *                         description: Total number of appointments for the salon.
   *                         example: 10
   *                       estimated_wait_time:
   *                         type: integer
   *                         description: Total estimated wait time for the salon.
   *                         example: 30
   *                       is_like:
   *                         type: boolean
   *                         description: Indicates if the salon is liked by the user.
   *                         example: true
   *                       barbers:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             barber_id:
   *                               type: integer
   *                               description: Unique ID of the barber.
   *                               example: 2
   *                             barber_name:
   *                               type: string
   *                               description: Name of the barber.
   *                               example: "John Doe"
   *                             service_time:
   *                               type: integer
   *                               description: Default service time of the barber.
   *                               example: 30
   *                             estimated_wait_time:
   *                               type: integer
   *                               description: Estimated wait time for the barber.
   *                               example: 15
   *                             min_wait_time:
   *                               type: integer
   *                               description: Minimum wait time across all barbers.
   *                               example: 5
   *                             max_wait_time:
   *                               type: integer
   *                               description: Maximum wait time across all barbers.
   *                               example: 20
   *       401:
   *         description: Invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Invalid token"
   *       403:
   *         description: Access denied due to missing token
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Access denied, token missing!"
   *       500:
   *         description: Error occurred while fetching salons
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "An error occurred while fetching salons"
   */
  app.get(`${apiPrefix}`, [authenticateToken], salonController.findAll);


  /**
   * @swagger
   * /api/salon/admin:
   *   get:
   *     summary: Get a list of salons with optional filtering, search, and pagination
   *     description: Fetch all salons with options to filter by favorites, search by salon name or status, and paginate results.
   *     tags: 
   *       - Salons
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         required: false
   *         description: The page number for pagination (default is 1).
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         required: false
   *         description: The number of salons to fetch per page (default is 10).
   *       - in: query
   *         name: favorites
   *         schema:
   *           type: boolean
   *         required: false
   *         description: Include salons marked as favorites (true or false).
   *       - in: query
   *         name: onlyfavorites
   *         schema:
   *           type: boolean
   *         required: false
   *         description: If true, fetches only salons marked as favorites by the user.
   *       - in: query
   *         name: searchName
   *         schema:
   *           type: string
   *         required: false
   *         description: Search for salons by name or status.
   *     responses:
   *       200:
   *         description: Successfully fetched salons
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
   *                   example: "Salons fetched successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalItems:
   *                       type: integer
   *                       description: The total number of salons matching the criteria.
   *                       example: 50
   *                     totalPages:
   *                       type: integer
   *                       description: Total number of pages available.
   *                       example: 5
   *                     currentPage:
   *                       type: integer
   *                       description: The current page number.
   *                       example: 1
   *                     salons:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           salon_id:
   *                             type: integer
   *                             description: The unique ID of the salon.
   *                             example: 1
   *                           salon_name:
   *                             type: string
   *                             description: The name of the salon.
   *                             example: "Elegant Cuts"
   *                           address:
   *                             type: string
   *                             description: The address of the salon.
   *                             example: "1234 Main St"
   *                           appointment_count:
   *                             type: integer
   *                             description: Total number of appointments for the salon.
   *                             example: 10
   *                           estimated_wait_time:
   *                             type: integer
   *                             description: Total estimated wait time for the salon.
   *                             example: 30
   *                           average_wait_time:
   *                             type: integer
   *                             description: Average wait time across barbers.
   *                             example: 20
   *                           min_wait_time:
   *                             type: integer
   *                             description: Minimum wait time among barbers.
   *                             example: 5
   *                           max_wait_time:
   *                             type: integer
   *                             description: Maximum wait time among barbers.
   *                             example: 35
   *                           is_like:
   *                             type: boolean
   *                             description: Indicates if the salon is liked by the user.
   *                             example: true
   *                           barbers:
   *                             type: array
   *                             items:
   *                               type: object
   *                               properties:
   *                                 barber_id:
   *                                   type: integer
   *                                   description: The unique ID of the barber.
   *                                   example: 2
   *                                 barber_name:
   *                                   type: string
   *                                   description: Name of the barber.
   *                                   example: "John Doe"
   *                                 service_time:
   *                                   type: integer
   *                                   description: Default service time of the barber.
   *                                   example: 30
   *                                 estimated_wait_time:
   *                                   type: integer
   *                                   description: Estimated wait time for the barber.
   *                                   example: 15
   *                                 availability_status:
   *                                   type: string
   *                                   description: Barber's availability status.
   *                                   example: "Available"
   *       401:
   *         description: Unauthorized access due to invalid token
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Invalid token"
   *       403:
   *         description: Access denied due to missing token
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Access denied, token missing!"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "An error occurred while fetching salons"
   */
  app.get(`${apiPrefix}/admin`, authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER,roles.BARBER), salonController.adminSalonfindAll);


 /**
 * @swagger
 * /api/salon/{id}:
 *   get:
 *     summary: Get a salon by ID with estimated wait time for barbers and weekend details
 *     tags: [Salons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the salon to fetch.
 *       - in: query
 *         name: favorites
 *         schema:
 *           type: boolean
 *         description: Whether to filter by favorite salons for the user (optional).
 *     responses:
 *       200:
 *         description: A salon's details along with barbers' estimated wait times and weekend hours
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful.
 *                 message:
 *                   type: string
 *                   description: A message providing additional information about the response.
 *                 data:
 *                   type: object
 *                   properties:
 *                     salon_id:
 *                       type: integer
 *                       description: The unique ID of the salon.
 *                     salon_name:
 *                       type: string
 *                       description: The name of the salon.
 *                     address:
 *                       type: string
 *                       description: The address of the salon.
 *                     appointment_count:
 *                       type: integer
 *                       description: The number of appointments associated with the salon.
 *                     weekend_day:
 *                       type: string
 *                       description: The weekend day for the salon (e.g., Saturday).
 *                     weekend_start:
 *                       type: string
 *                       description: The start time for weekend hours (e.g., 10:00 AM).
 *                     weekend_end:
 *                       type: string
 *                       description: The end time for weekend hours (e.g., 6:00 PM).
 *                     barbers:
 *                       type: array
 *                       description: A list of barbers associated with the salon.
 *                       items:
 *                         type: object
 *                         properties:
 *                           barber_id:
 *                             type: integer
 *                             description: The unique ID of the barber.
 *                           barber_name:
 *                             type: string
 *                             description: The name of the barber.
 *                           service_time:
 *                             type: integer
 *                             description: The service time required by the barber in minutes.
 *                           estimated_wait_time:
 *                             type: integer
 *                             description: The estimated wait time for the barber (in minutes).
 *                           cutting_since:
 *                             type: string
 *                             description: The date when the barber started cutting (formatted as YYYY-MM-DD).
 *                           organization_join_date:
 *                             type: string
 *                             description: The date when the barber joined the organization (formatted as YYYY-MM-DD).
 *                           photo:
 *                             type: string
 *                             description: URL of the barber's photo.
 *                     is_favorite:
 *                       type: boolean
 *                       description: Indicates whether the salon is marked as a favorite by the user.
 *                     is_like:
 *                       type: boolean
 *                       description: Indicates whether the salon is liked by the user (if the favorites query parameter is used).
 *       404:
 *         description: Salon not found.
 *       500:
 *         description: Internal server error.
 */

  app.get(`${apiPrefix}/:id`,[authenticateToken], salonController.findOne);

/**
 * @swagger
 * /api/salon/{id}:
 *   put:
 *     summary: Update a salon by ID with multiple photos
 *     tags: [Salons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The salon ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the salon
 *               address:
 *                 type: string
 *                 description: Address of the salon
 *               phone_number:
 *                 type: string
 *                 description: Phone number of the salon
 *               open_time:
 *                 type: string
 *                 description: Opening time of the salon (e.g., "09:00")
 *               close_time:
 *                 type: string
 *                 description: Closing time of the salon (e.g., "18:00")
 *               weekend_day:
 *                 type: boolean
 *                 description: Indicates if the salon is open on weekends
 *               weekend_start:
 *                 type: string
 *                 description: Starting time on weekends (e.g., "10:00")
 *               weekend_end:
 *                 type: string
 *                 description: Ending time on weekends (e.g., "16:00")
 *               status:
 *                 type: string
 *                 enum: [open, close]
 *                 description: status 
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload multiple photos (up to 5 photos)
 *               firstname:
 *                 type: string
 *                 description: First name of the associated user
 *               lastname:  
 *                 type: string
 *                 description: Last name of the associated user
 *     responses:
 *       200:
 *         description: Salon and associated user updated successfully
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
 *                   example: Salon and associated user updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     salon:
 *                       $ref: '#/components/schemas/Salon'
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: Salon or user not found
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
 *                   example: Salon not found
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
 *                   example: An error occurred while updating the salon
 */
  // Route to update a salon by ID with multiple photos upload
  app.put(`${apiPrefix}/:id`, upload.array('photos', 5), authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER), salonController.update);

  /**
   * @swagger
   * /api/salon/{id}:
   *   delete:
   *     summary: Delete a salon by ID
   *     tags: [Salons]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: The salon ID
   *     responses:
   *       200:
   *         description: Salon deleted successfully
   *       404:
   *         description: Salon not found
   *       500:
   *         description: Internal server error
   */
  
  // Route to delete a salon by ID
  app.delete(`${apiPrefix}/:id`, authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER), salonController.delete);


  /**
 * @swagger
 * /api/salon/status/{id}:
 *   patch:
 *     summary: Update the status of a salon
 *     tags: [Salons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the salon to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status of the salon
 *                 example: "Open"
 *     responses:
 *       200:
 *         description: Salon status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Salon status updated successfully
 *                 salon:
 *                   type: object
 *                   description: The updated salon object
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Status is required
 *       403:
 *         description: Forbidden - User not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are not authorized to update this salon status
 *       404:
 *         description: Salon not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Salon not found for the logged-in user
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred while updating the salon status
 */

  // Route to update a salon by ID.
  app.patch(`${apiPrefix}/status/:id`, authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER), salonController.updateStatus);

};
