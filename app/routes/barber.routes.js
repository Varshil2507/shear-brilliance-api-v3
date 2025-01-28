const express = require("express");
const path = require("path");
const barberController = require("../controllers/barber.controller");
const upload = require("../config/multer.config");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const { role } = require("../config/roles.config");
const roles = require("../config/roles.config").role;

module.exports = (app) => {
  const apiPrefix = "/api/barber";

  /**
   * @swagger
   * tags:
   *   name: Barbers
   *   description: API for managing barbers
   */

/**
 * @swagger
 * /api/barber:
 *   post:
 *     summary: Create a new barber
 *     tags: [Barbers]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: Barber's first name
 *                 example: John
 *               lastname:
 *                 type: string
 *                 description: Barber's last name
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Barber's email address (must be unique)
 *                 example: john.doe@example.com
 *               mobile_number:
 *                 type: string
 *                 description: Barber's mobile number
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 description: Password for the barber's account
 *                 example: "password123"
 *               availability_status:
 *                 type: string
 *                 description: Availability status of the barber
 *                 example: "available"
 *               cutting_since:
 *                 type: string
 *                 format: date
 *                 description: Date when the barber started cutting hair (YYYY-MM-DD)
 *                 example: "2015-06-15"
 *               organization_join_date:
 *                 type: string
 *                 format: date
 *                 description: Date when the barber joined the organization (YYYY-MM-DD)
 *                 example: "2023-01-01"
 *               SalonId:
 *                 type: integer
 *                 description: ID of the salon the barber belongs to
 *                 example: 3
 *               address:
 *                 type: string
 *                 description: Barber's address
 *                 example: "123 Barber Street, Hairville"
 *               background_color:
 *                 type: string
 *                 description: Barber's background color (Hex or descriptive value)
 *                 example: "#FFFFFF"
 *               category:
 *                 type: string
 *                 description: Category of the barber (1 = for_appointment, 2 = for_booking)
 *                 enum:
 *                   - "1"
 *                   - "2"
 *                 example: "1"
 *               position:
 *                 type: string
 *                 description: Position of the barber within the salon
 *                 enum:
 *                   - Senior
 *                   - Master
 *                   - Executive
 *                   - Braider
 *                   - Junior
 *                   - Trainee
 *                   - Student
 *                 example: "Senior"
 *               non_working_days:
 *                 type: array
 *                 description: List of non-working days (1 = Monday, 7 = Sunday)
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 7
 *                 example: [1, 7]
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Upload the barber's profile photo (optional)
 *               servicesWithPrices:
 *                 type: array
 *                 description: Array of services with custom prices for the barber
 *                 items:
 *                   type: object
 *                   properties:
 *                     ServiceId:
 *                       type: integer
 *                       description: ID of the service
 *                       example: 1
 *                     price:
 *                       type: number
 *                       format: float
 *                       description: Custom price for the service
 *                       example: 50.00
 *               weekly_schedule:
 *                 type: object
 *                 description: Weekly schedule for the barber (Optional)
 *                 properties:
 *                   Monday:
 *                     type: object
 *                     properties:
 *                       start_time:
 *                         type: string
 *                         format: time
 *                         description: Start time on Monday (HH:mm format, 24-hour clock)
 *                         example: "09:00"
 *                       end_time:
 *                         type: string
 *                         format: time
 *                         description: End time on Monday (HH:mm format, 24-hour clock)
 *                         example: "17:00"
 *                   Tuesday:
 *                     type: object
 *                     properties:
 *                       start_time:
 *                         type: string
 *                         format: time
 *                         description: Start time on Tuesday (HH:mm format, 24-hour clock)
 *                         example: "09:00"
 *                       end_time:
 *                         type: string
 *                         format: time
 *                         description: End time on Tuesday (HH:mm format, 24-hour clock)
 *                         example: "17:00"
 *                   Wednesday:
 *                     type: object
 *                     properties:
 *                       start_time:
 *                         type: string
 *                         format: time
 *                         description: Start time on Wednesday (HH:mm format, 24-hour clock)
 *                         example: "09:00"
 *                       end_time:
 *                         type: string
 *                         format: time
 *                         description: End time on Wednesday (HH:mm format, 24-hour clock)
 *                         example: "17:00"
 *                   Thursday:
 *                     type: object
 *                     properties:
 *                       start_time:
 *                         type: string
 *                         format: time
 *                         description: Start time on Thursday (HH:mm format, 24-hour clock)
 *                         example: "09:00"
 *                       end_time:
 *                         type: string
 *                         format: time
 *                         description: End time on Thursday (HH:mm format, 24-hour clock)
 *                         example: "17:00"
 *                   Friday:
 *                     type: object
 *                     properties:
 *                       start_time:
 *                         type: string
 *                         format: time
 *                         description: Start time on Friday (HH:mm format, 24-hour clock)
 *                         example: "09:00"
 *                       end_time:
 *                         type: string
 *                         format: time
 *                         description: End time on Friday (HH:mm format, 24-hour clock)
 *                         example: "17:00"
 *                   Saturday:
 *                     type: object
 *                     properties:
 *                       start_time:
 *                         type: string
 *                         format: time
 *                         description: Start time on Saturday (HH:mm format, 24-hour clock)
 *                         example: "09:00"
 *                       end_time:
 *                         type: string
 *                         format: time
 *                         description: End time on Saturday (HH:mm format, 24-hour clock)
 *                         example: "17:00"
 *                   Sunday:
 *                     type: object
 *                     properties:
 *                       start_time:
 *                         type: string
 *                         format: time
 *                         description: Start time on Sunday (HH:mm format, 24-hour clock)
 *                         example: "09:00"
 *                       end_time:
 *                         type: string
 *                         format: time
 *                         description: End time on Sunday (HH:mm format, 24-hour clock)
 *                         example: "17:00"
 *     responses:
 *       200:
 *         description: Barber created successfully
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
 *                   example: "Barber created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     barber:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         availability_status:
 *                           type: string
 *                           example: "available"
 *                         cutting_since:
 *                           type: string
 *                           format: date
 *                           example: "2015-06-15"
 *                         organization_join_date:
 *                           type: string
 *                           format: date
 *                           example: "2023-01-01"
 *                         SalonId:
 *                           type: integer
 *                           example: 3
 *                         background_color:
 *                           type: string
 *                           example: "#FFFFFF"
 *                         default_start_time:
 *                           type: string
 *                           format: time
 *                           example: "09:00"
 *                         default_end_time:
 *                           type: string
 *                           format: time
 *                           example: "17:00"
 *                         category:
 *                           type: string
 *                           example: "1"
 *                         position:
 *                           type: string
 *                           example: "Senior"
 *                         non_working_days:
 *                           type: array
 *                           items:
 *                             type: integer
 *                           example: [1, 7]
 *                         UserId:
 *                           type: integer
 *                           example: 2
 *       400:
 *         description: Invalid input or missing required fields
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
 *                   example: "All fields are required"
 *       409:
 *         description: Conflict error (e.g., Email already exists)
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
 *                   example: "Email already exists"
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
 *                   example: "An error occurred while creating the barber"
 */

app.post(
    `${apiPrefix}`,
    authenticateJWT,
    authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER),
    upload.single("photo"),
    barberController.create
  );

 /**
 * @swagger
 * /api/barber:
 *   get:
 *     summary: Get all barbers
 *     tags: [Barbers]
 *     parameters:
 *       - in: query
 *         name: salonId
 *         schema:
 *           type: integer
 *         description: Filter barbers by the salon ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *           enum: [1, 2]
 *         description: Filter barbers by category (1 for appointment, 2 for checking)
 *     responses:
 *       200:
 *         description: A list of barbers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 message:
 *                   type: string
 *                   description: Response message
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The barber's unique ID
 *                       name:
 *                         type: string
 *                         description: The barber's name
 *                       Salon:
 *                         type: object
 *                         description: Associated salon details
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       User:
 *                         type: object
 *                         description: Associated user details
 *                         properties:
 *                           id:
 *                             type: integer
 *                           email:
 *                             type: string
 *                           name:
 *                             type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 message:
 *                   type: string
 *                   description: Error message
 */
  app.get(`${apiPrefix}`, authenticateJWT,
    authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER, roles.CUSTOMER), barberController.findAll);

  /**
   * @swagger
   * /api/barber/admin:
   *   get:
   *     summary: Retrieve a list of barbers
   *     description: Retrieve a list of barbers with pagination and optional filtering. Filters include salon ID, username, salon name, and status. The search query can be used to search across multiple fields.
   *     tags:
   *       - Barbers
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         required: false
   *         description: The page number for pagination. Default is 1.
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         required: false
   *         description: The number of results per page for pagination. Default is 10.
   *       - in: query
   *         name: salonId
   *         schema:
   *           type: integer
   *         required: false
   *         description: The salon ID to filter barbers by a specific salon.
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         required: false
   *         description: The search term to filter barbers based on username, salon name, or status. Partial matches are allowed.
   *     responses:
   *       200:
   *         description: A list of barbers along with salon and user information.
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
   *                   example: "Barbers retrieved successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalItems:
   *                       type: integer
   *                       example: 20
   *                     totalPages:
   *                       type: integer
   *                       example: 2
   *                     currentPage:
   *                       type: integer
   *                       example: 1
   *                     barbers:
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
   *                           salon:
   *                             type: object
   *                             properties:
   *                               id:
   *                                 type: integer
   *                                 example: 1
   *                               name:
   *                                 type: string
   *                                 example: "Downtown Salon"
   *                           user:
   *                             type: object
   *                             properties:
   *                               id:
   *                                 type: integer
   *                                 example: 1
   *                               username:
   *                                 type: string
   *                                 example: "johndoe"
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
   *                   example: "Internal server error"
   */
  app.get(
    `${apiPrefix}/admin`,
    authenticateJWT,
    authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER,roles.BARBER),
    barberController.adminBarberfindAll
  );

/**
 * @swagger
 * /api/barber/{id}:
 *   put:
 *     summary: Update a barber by ID
 *     description: Update barber details, including user information, profile photo, services with prices, and availability. If a new profile photo is uploaded, it replaces the existing photo.
 *     tags: [Barbers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The barber's unique ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: Barber's first name
 *                 example: John
 *               lastname:
 *                 type: string
 *                 description: Barber's last name
 *                 example: Doe
 *               mobile_number:
 *                 type: string
 *                 description: Barber's mobile number (e.g., international format with '+' prefix)
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 description: Barber's residential address
 *                 example: "123 Main Street, City, Country"
 *               availability_status:
 *                 type: string
 *                 description: Availability status of the barber
 *                 example: available
 *               cutting_since:
 *                 type: string
 *                 format: date
 *                 description: Date when the barber started cutting hair (YYYY-MM-DD)
 *                 example: "2015-06-15"
 *               organization_join_date:
 *                 type: string
 *                 format: date
 *                 description: Date when the barber joined the organization (YYYY-MM-DD)
 *                 example: "2020-01-10"
 *               SalonId:
 *                 type: integer
 *                 description: ID of the salon the barber is associated with
 *                 example: 2
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Upload a new profile photo for the barber
 *               background_color:
 *                 type: string
 *                 description: Hexadecimal background color for the barber's profile
 *                 example: "#ff5733"
 *               default_start_time:
 *                 type: string
 *                 format: time
 *                 description: Barber's daily start time (HH:mm:ss)
 *                 example: "09:00:00"
 *               default_end_time:
 *                 type: string
 *                 format: time
 *                 description: Barber's daily end time (HH:mm:ss)
 *                 example: "17:00:00"
 *               category:
 *                 type: integer
 *                 description: Category of the barber (1 = for appointments, 2 = for bookings)
 *                 enum: [1, 2]
 *               position:
 *                 type: string
 *                 description: Position of the barber in the salon
 *                 enum: [Senior, Master, Executive, Braider, Junior, Trainee, Student]
 *                 example: Senior
 *               non_working_days:
 *                 type: string
 *                 description: Comma-separated list, JSON array, or array of integers (1 = Monday, 7 = Sunday)
 *                 example: "1,5,7"
 *               servicesWithPrices:
 *                type: array
 *                description: Array of services with custom prices for the barber
 *                items:
 *                  type: object
 *                  properties:
 *                    ServiceId:
 *                      type: integer
 *                      description: ID of the service
 *                      example: 1
 *                    price:
 *                      type: number
 *                      format: float
 *                      description: Custom price for the service
 *                      example: 50.00
 *     responses:
 *       200:
 *         description: Barber updated successfully
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
 *                   example: "Barber updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     barber:
 *                       type: object
 *                       description: Updated barber information
 *       400:
 *         description: Bad request due to validation errors (e.g., invalid non_working_days or servicesWithPrices)
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
 *                   example: "Invalid format for servicesWithPrices. Must be a valid JSON array."
 *       404:
 *         description: Barber not found or associated user not found
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
 *                   example: "Barber not found"
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
 *                   example: "An error occurred while updating the barber"
 */

//update barber 
  app.put(
    `${apiPrefix}/:id`,
    authenticateJWT,
    authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.BARBER, roles.SALON_MANAGER),
    upload.single("photo"),
    barberController.update
  );


  

  /**
   * @swagger
   * /api/barber/{id}:
   *   delete:
   *     summary: Delete a barber by ID
   *     tags: [Barbers]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: The barber ID
   *     responses:
   *       200:
   *         description: Barber deleted successfully
   *       404:
   *         description: Barber not found
   *       500:
   *         description: Internal server error
   */
  app.delete(
    `${apiPrefix}/:id`,
    authenticateJWT,
    authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER),
    barberController.delete
  );

  /**
   * @swagger
   * /api/barber/images/{filename}:
   *   get:
   *     summary: Get a barber's profile image by filename
   *     tags: [Barbers]
   *     parameters:
   *       - in: path
   *         name: filename
   *         required: true
   *         schema:
   *           type: string
   *         description: The name of the image file
   *     responses:
   *       200:
   *         description: Image retrieved successfully
   *       404:
   *         description: Image not found
   *       500:
   *         description: Internal server error
   */
  app.get(`${apiPrefix}/images/:filename`, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../../uploads", filename);

    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(err.status).send({ message: "Image not found." });
      }
    });
  });

  /**
   * @swagger
   * /api/barber/status/{id}:
   *   put:
   *     summary: Manually update a barber's status
   *     tags: [Barbers]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: The barber ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [available, unavailable, running]
   *                 description: The new status for the barber
   *     responses:
   *       200:
   *         description: Barber status updated successfully
   *       400:
   *         description: Invalid status
   *       500:
   *         description: Internal server error
   */
  app.put(`${apiPrefix}/status/:id`, barberController.setBarberStatus);



/**
 * @swagger
 * /api/barber/user/{userId}/availability-status:
 *   patch:
 *     summary: Update a barber's availability status based on user ID
 *     tags: [Barbers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID associated with the barber whose status needs to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, unavailable, running]
 *                 description: The new status for the barber
 *                 example: available
 *     responses:
 *       200:
 *         description: Barber availability status updated successfully
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
 *                   example: Barber availability status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     barber:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         availability_status:
 *                           type: string
 *                           example: available
 *       400:
 *         description: Invalid status or missing required field
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
 *                   example: Invalid status value. Allowed values are 'available', 'unavailable', or 'running'.
 *                 data:
 *                   type: null
 *       404:
 *         description: Barber not found
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
 *                   example: Barber not found
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
 *                   example: An error occurred while updating the barber's availability status
 *                 data:
 *                   type: null
 */

 // Patch API for updating barber's availability status based on user ID
app.patch(`${apiPrefix}/user/:userId/availability-status`, authenticateJWT, authorizeRoles(roles.BARBER), barberController.updateAvailabilityStatus);



/**
 * @swagger
 * /barbers/{id}/category:
 *   patch:
 *     summary: Update the category of a barber
 *     tags:
 *       - Barbers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the barber to update
 *       - in: body
 *         name: category
 *         required: true
 *         description: The new category for the barber (1 for ForAppointment, 2 for ForWalkIn)
 *         schema:
 *           type: object
 *           properties:
 *             category:
 *               type: integer
 *               enum: [1, 2]
 *               description: Category value (1 for ForAppointment, 2 for ForWalkIn)
 *     responses:
 *       200:
 *         description: Barber category updated successfully
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
 *                     barber:
 *                       $ref: '#/components/schemas/Barber'
 *       400:
 *         description: Invalid input or validation error
 *       404:
 *         description: Barber not found
 */
// PATCH route to update barber category
app.patch(
  `${apiPrefix}/:id/category`,
  authenticateJWT,
  authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER), // Restrict access to specific roles
  barberController.updateCategory
);


};
