const authController = require("../controllers/auth.controller");
const { authenticateToken } = require('../middleware/authenticate.middleware'); // Adjust the path as needed

module.exports = app => {
    // API Prefix for authentication
    const apiPrefix = "/api/auth";
   
    /**
     * @swagger
     * components:
     *   schemas:
     *     UserSignup:
     *       type: object
     *       required:
     *         - username
     *         - firstname
     *         - lastname
     *         - mobile_number
     *         - email
     *         - password
     *       properties:
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
     *           description: Address of the user
     *         mobile_number:
     *           type: string
     *           description: Mobile number of the user
     *         email:
     *           type: string
     *           description: Email of the user
     *         password:
     *           type: string
     *           description: Password for the user
     *       example:
     *         username: john_doe
     *         firstname: John
     *         lastname: Doe
     *         address: "123 Main St"
     *         mobile_number: "1234567890"
     *         email: johndoe@example.com
     *         password: "hashedpassword"
     *
     *     AdminSignup:
     *       type: object
     *       required:
     *         - username
     *         - firstname
     *         - lastname
     *         - mobile_number
     *         - email
     *         - password
     *         - RoleId
     *       properties:
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
     *           description: Address of the user
     *         mobile_number:
     *           type: string
     *           description: Mobile number of the user
     *         email:
     *           type: string
     *           description: Email of the user
     *         password:
     *           type: string
     *           description: Password for the user
     *         RoleId:
     *           type: integer
     *           description: Role ID of the user (admin-level access only)
     *       example:
     *         username: admin_user
     *         firstname: Admin
     *         lastname: User
     *         address: "123 Admin St"
     *         mobile_number: "9876543210"
     *         email: admin@example.com
     *         password: "hashedpassword"
     *         RoleId: 1
     *
     *     UserLogin:
     *       type: object
     *       required:
     *         - email
     *         - password
     *       properties:
     *         email:
     *           type: string
     *           description: The user's email
     *         password:
     *           type: string
     *           description: The user's password
     *       example:
     *         email: johndoe@example.com
     *         password: "password123"
     */

    /**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user with a specified role
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - address
 *               - mobile_number
 *               - email
 *               - password
 *               - role_name
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: First name of the user
 *               lastname:
 *                 type: string
 *                 description: Last name of the user
 *               address:
 *                 type: string
 *                 description: Address of the user
 *               mobile_number:
 *                 type: string
 *                 description: Mobile number of the user (10 digits)
 *                 example: "1234567890"
 *               email:
 *                 type: string
 *                 description: Email address of the user
 *                 example: "example@example.com"
 *               password:
 *                 type: string
 *                 description: Password for the user account
 *               role_name:
 *                 type: string
 *                 description: Role name for the user (e.g., Admin, Customer, Barber)
 *               profile_photo:
 *                 type: string
 *                 description: Optional profile photo URL
 *                 nullable: true
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                   description: Success message
 *                   example: "User registered successfully"
 *                 data:
 *                   type: object
 *                   description: Details of the registered user
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Unique ID of the user
 *                       example: 1
 *                     username:
 *                       type: string
 *                       description: Generated unique username
 *                       example: "john_doe1"
 *                     firstname:
 *                       type: string
 *                       description: First name
 *                     lastname:
 *                       type: string
 *                       description: Last name
 *                     address:
 *                       type: string
 *                       description: Address of the user
 *                     mobile_number:
 *                       type: string
 *                       description: Mobile number
 *                       example: "1234567890"
 *                     email:
 *                       type: string
 *                       description: Email address
 *                     role_name:
 *                       type: string
 *                       description: Name of the assigned role
 *                       example: "Customer"
 *                     profile_photo:
 *                       type: string
 *                       description: URL of the profile photo
 *                       nullable: true
 *       400:
 *         description: Validation error or missing fields
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
 *                   description: Error message
 *                   example: "All fields are required"
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 errors:
 *                   type: array
 *                   description: List of validation error messages
 *                   items:
 *                     type: string
 *                   example: ["Invalid mobile number format. It should be 10 digits.", "Email already exists"]
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
 *                   example: "Internal server error"
 *                 code:
 *                   type: integer
 *                   example: 500
 */
    app.post(`${apiPrefix}/signup`, authController.register);

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Log in a user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserLogin'
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Success message
     *                 token:
     *                   type: string
     *                   description: JWT token for authentication
     *                 user:
     *                   type: object
     *                   description: The logged-in user object without the password
     *       401:
     *         description: Invalid credentials
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    app.post(`${apiPrefix}/login`, authController.login);

    /**
     * @swagger
     * /api/auth/register-user:
     *   post:
     *     summary: Register a user (auto-assigns the user role)
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserSignup'
     *     responses:
     *       201:
     *         description: User registered successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Success message
     *                 user:
     *                   type: object
     *                   description: The created user object
     *       400:
     *         description: Email already exists
     *       500:
     *         description: Server error
     */
    app.post(`${apiPrefix}/register-user`, authController.registerUser);

    /**
     * @swagger
     * /api/auth/login-user:
     *   post:
     *     summary: Log in a user (with auto-assigned role)
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserLogin'
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Success message
     *                 token:
     *                   type: string
     *                   description: JWT token for authentication
     *                 user:
     *                   type: object
     *                   description: The logged-in user object without the password
     *       401:
     *         description: Invalid credentials
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    app.post(`${apiPrefix}/login-user`, authController.loginUser);

    /**
 * @swagger
 * /api/auth/google-login:
 *   post:
 *     summary: Log in a user with Google OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google OAuth token
 *                 example: "ya29.A0AfH6SMB-5yL9aB..."
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   description: The logged-in user object without the password
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123456789"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *       400:
 *         description: Bad Request - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred during login"
 */
    app.post(`${apiPrefix}/google-login`, authController.googleLogin);

    /**
 * @swagger
 * /api/auth/apple-login:
 *   post:
 *     summary: Log in a user with Apple OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Apple OAuth token
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Apple login successful"
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   description: The logged-in user object without the password
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123456789"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     username:
 *                       type: string
 *                       example: "AppleUser"
 *       400:
 *         description: Bad Request - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid Apple token"
 *       404:
 *         description: User role not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User role not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred during login"
 */
    app.post(`${apiPrefix}/apple-login`, authController.appleLogin);

    // forgot password api
    app.post(`${apiPrefix}/forgot-password`, authController.forgotPassword);

    // reste password api
    app.post(`${apiPrefix}/reset-password`, authController.resetPassword);

    /**
 * @swagger
 * /api/users/userInfo:
 *   get:
 *     summary: Get information about the authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []  # Indicate that this route requires Bearer token authentication
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
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
 *                   example: User retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: john_doe
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *       403:
 *         description: Unauthorized or token verification failed
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
 *                   example: "Token verification failed"
 *       404:
 *         description: User not found
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
 *                   example: "User not found"
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
 *                   example: "Error retrieving user"
 */
app.get(`${apiPrefix}/userInfo`, [authenticateToken], authController.userInfo);

};
