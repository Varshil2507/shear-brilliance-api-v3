const express = require("express");
const path = require("path"); // Import the path module to handle file paths
const usersController = require("../controllers/user.controller");
const upload = require('../config/multer.config'); // Import multer configuration
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const roles = require('../config/roles.config').role;
const { authenticateToken } = require('../middleware/authenticate.middleware');

module.exports = app => {
    // API prefix for user routes
    const apiPrefix = "/api/users";

 /**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - firstname
 *         - lastname
 *         - mobile_number
 *         - email
 *         - password
 *         - profile_photo
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated user ID
 *         username:
 *           type: string
 *           description: Unique username for the user
 *         firstname:
 *           type: string
 *           description: First name of the user
 *         lastname:
 *           type: string
 *           description: Last name of the user
 *         address:
 *           type: string
 *           description: User's address
 *         mobile_number:
 *           type: string
 *           description: Mobile number of the user
 *         email:
 *           type: string
 *           description: Unique email address of the user
 *         google_token:
 *           type: string
 *           description: Google authentication token, if applicable
 *         apple_token:
 *           type: string
 *           description: Apple authentication token, if applicable
 *         password:
 *           type: string
 *           description: Hashed password of the user
 *         profile_photo:
 *           type: string
 *           description: Path to the user's profile photo
 *         RoleId:
 *           type: integer
 *           description: Foreign key referencing the user's role
 *         salonId:
 *           type: integer
 *           description: Optional salon ID for users with "Salon Manager" role (optional)
 *       example:
 *         id: 1
 *         username: john_doe
 *         firstname: John
 *         lastname: Doe
 *         address: 123 Main St
 *         mobile_number: "1234567890"
 *         email: johndoe@example.com
 *         google_token: "someGoogleToken"
 *         apple_token: "someAppleToken"
 *         password: "hashedpassword"
 *         profile_photo: "uploads/johndoe.jpg"
 *         RoleId: 2
 *         salonId: 1
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user with optional profile photo upload and associate salon if "Salon Manager"
 *     tags: [Users]
 *     security:
 *       - bearerAuth: [] # Requires JWT authentication
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: First name of the user
 *                 example: John
 *               lastname:
 *                 type: string
 *                 description: Last name of the user
 *                 example: Doe
 *               address:
 *                 type: string
 *                 description: Address of the user
 *                 example: 123 Main Street
 *               mobile_number:
 *                 type: string
 *                 description: Mobile number of the user
 *                 example: "+1234567890"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Unique email address of the user
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the user
 *                 example: MyS3cretP@ssw0rd
 *               profile_photo:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo file upload (optional)
 *               RoleId:
 *                 type: integer
 *                 description: ID of the role to assign to the user
 *                 example: 2
 *               SalonId:
 *                 type: integer
 *                 description: ID of the salon to associate with the user (required for "Salon Manager" role only)
 *                 example: 1
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the operation was successful
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Descriptive message about the response
 *                   example: User created successfully
 *                 data:
 *                   type: object
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request. Missing or invalid data.
 *       401:
 *         description: Unauthorized. Token missing or invalid
 *       403:
 *         description: Forbidden. Insufficient permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operations related to users (creation, updating, etc.)
 */



    // Route to create a new user with profile photo upload
    app.post(`${apiPrefix}`, upload.single('profile_photo'), authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER,roles.SALON_MANAGER), usersController.create);

    
   /**
   * @swagger
   * /api/users/filter:
   *   get:
   *     summary: Retrieve users with optional filters for salon_id and role_id
   *     tags: [Users]
   *     parameters:
   *       - in: query
   *         name: roleId
   *         schema:
   *           type: integer
   *         required: false
   *         description: ID of the role to filter users
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         required: false
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         required: false
   *         description: Number of users per page
   *     responses:
   *       200:
   *         description: List of users filtered by salon_id and/or role_id
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalItems:
   *                   type: integer
   *                   description: Total number of users matching the filters
   *                 totalPages:
   *                   type: integer
   *                   description: Total number of pages based on limit
   *                 currentPage:
   *                   type: integer
   *                   description: Current page number
   *                 users:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/User'
   *       500:
   *         description: Server error
   */
   // Route to get users with optional filters for salonId and roleId
    app.get(`${apiPrefix}/filter`,authenticateJWT, authorizeRoles(roles.ADMIN), usersController.findByFilters);

    /**
     * @swagger
     * /api/users/{id}:
     *   get:
     *     summary: Get a user by ID
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The ID of the user to retrieve
     *     responses:
     *       200:
     *         description: The user details by ID
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    // Route to get a user by ID
    app.get(`${apiPrefix}/:id`,authenticateJWT, usersController.findOne);

  /**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user by ID with profile photo upload
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Updated username for the user
 *               firstname:
 *                 type: string
 *                 description: Updated first name of the user
 *               lastname:
 *                 type: string
 *                 description: Updated last name of the user
 *               mobile_number:
 *                 type: string
 *                 description: Updated mobile number of the user
 *               email:
 *                 type: string
 *                 description: Updated email of the user
 *               profile_photo:
 *                 type: string
 *                 format: binary
 *                 description: Updated profile photo of the user
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
  // Route to update a user by ID
  app.put(`${apiPrefix}/:id`, upload.single('profile_photo'), authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER, roles.CUSTOMER),usersController.update);


    /**
     * @swagger
     * /api/users/{id}:
     *   delete:
     *     summary: Delete a user by ID
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The ID of the user to delete
     *     responses:
     *       204:
     *         description: User deleted successfully
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    // Route to delete a user by ID
    app.delete(`${apiPrefix}/:id`, authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER, roles.CUSTOMER), usersController.delete);

   
   /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Retrieve users with pagination and optional search filter
   *     tags: [Users]
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [user, customer]
   *         required: false
   *         description: The type of users to filter (e.g., `user` for Barber, Salon Owner, Admin; `customer` for Customer role only)
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         required: false
   *         description: A search term to filter users by `firstname`, `lastname`, or `email`. This parameter is case-insensitive and will match any of the fields.
   *         example: "john"
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         required: false
   *         description: The page number to retrieve (default is 1)
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         required: false
   *         description: The number of users to return per page (default is 10)
   *     responses:
   *       200:
   *         description: A list of users with pagination info
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalItems:
   *                   type: integer
   *                   description: Total number of users matching the filters
   *                 totalPages:
   *                   type: integer
   *                   description: Total number of pages based on the limit
   *                 currentPage:
   *                   type: integer
   *                   description: Current page number
   *                 users:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       username:
   *                         type: string
   *                       firstname:
   *                         type: string
   *                       lastname:
   *                         type: string
   *                       email:
   *                         type: string
   *                       role:
   *                         type: string
   *                         description: The role of the user (Admin, Salon Owner, Barber, Customer)
   *       403:
   *         description: Access denied due to role restrictions
   *       500:
   *         description: Server error
   */

   // Route to retrieve users with pagination and filters
    app.get(`${apiPrefix}`, authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER),usersController.getAllUsers);


   /**
   * @swagger
   * /api/users/send-reset-email:
   *   post:
   *     summary: Send a password reset email
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 description: The email address of the user requesting a password reset.
   *                 example: "user@example.com"
   *     responses:
   *       200:
   *         description: Password reset link has been sent to the user's email.
   *       400:
   *         description: Invalid email address or email format.
   *       404:
   *         description: User not found with the provided email address.
   *       500:
   *         description: Internal server error, failed to send the reset email.
   */
  // Forgot-password 
  app.post(`${apiPrefix}/send-reset-email`, usersController.sendResetEmail);


  /**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Reset the user's password using the reset token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The reset token sent to the user's email.
 *                 example: "abc123xyz456"
 *               newPassword:
 *                 type: string
 *                 description: The new password for the user.
 *                 example: "newSecurePassword123!"
 *     responses:
 *       200:
 *         description: The user's password has been successfully reset.
 *       400:
 *         description: Invalid or expired reset token.
 *       500:
 *         description: Internal server error, failed to reset the password.
 */
  // reset password
  app.post(`${apiPrefix}/reset-password`, usersController.resetPassword);


  /**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change the user's password by providing old and new passwords
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []  # JWT Token required in the Authorization header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: The user's current password
 *               newPassword:
 *                 type: string
 *                 description: The new password to set
 *             required:
 *               - oldPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password successfully changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the password was changed successfully.
 *                 message:
 *                   type: string
 *                   description: Message confirming successful password change.
 *       400:
 *         description: Old password is incorrect or other validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates a failure due to incorrect old password or invalid input.
 *                 message:
 *                   type: string
 *                   description: Detailed error message.
 *       401:
 *         description: Invalid or expired JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates authentication failure due to invalid token.
 *                 message:
 *                   type: string
 *                   description: Message indicating the reason for authentication failure.
 *       403:
 *         description: Access denied, token missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates failure due to missing authentication token.
 *                 message:
 *                   type: string
 *                   description: Error message indicating missing token.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: Error message for server issues.
 */
  app.post(`${apiPrefix}/change-password`,authenticateJWT, usersController.changePassword);

  /**
 * @swagger
 * /api/users/update/{id}:
 *   patch:
 *     summary: Update a user's fields by ID with optional profile photo upload
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: Updated first name of the user
 *               lastname:
 *                 type: string
 *                 description: Updated last name of the user
 *               mobile_number:
 *                 type: string
 *                 description: Updated mobile number of the user
 *               address:
 *                 type: string
 *                 description: Updated address of the user
 *               profile_photo:
 *                 type: string
 *                 format: binary
 *                 description: Updated profile photo of the user
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: "User updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: No fields provided to update
 *       404:
 *         description: User not found
 *       500:
 *         description: An error occurred while updating the user
 */
  // patch request to upadte user fields 
  app.patch(`${apiPrefix}/update/:id`,[authenticateToken], upload.single('profile_photo'), usersController.updateUser);

  
};
