const rolesController = require("../controllers/role.controller");
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const roles = require('../config/roles.config').role;

module.exports = (app) => {
    // Define the API prefix for roles
    const apiPrefix = "/api/roles";


    /**
     * @swagger
     * components:
     *   schemas:
     *     Role:
     *       type: object
     *       required:
     *         - role_name
     *       properties:
     *         id:
     *           type: integer
     *           description: The auto-generated ID of the role
     *         role_name:
     *           type: string
     *           description: The name of the role
     *         description:
     *           type: string
     *           description: Optional description of the role
     *         can_create_appointment:
     *           type: boolean
     *           description: Can the role create appointments?
     *         can_modify_appointment:
     *           type: boolean
     *           description: Can the role modify appointments?
     *         can_cancel_appointment:
     *           type: boolean
     *           description: Can the role cancel appointments?
     *         can_view_customers:
     *           type: boolean
     *           description: Can the role view customer details?
     *         can_manage_staff:
     *           type: boolean
     *           description: Can the role manage staff?
     *         can_manage_services:
     *           type: boolean
     *           description: Can the role manage services?
     *         can_access_reports:
     *           type: boolean
     *           description: Can the role access reports?
     *       example:
     *         id: 1
     *         role_name: Admin
     *         description: Admin role with full access
     *         can_create_appointment: true
     *         can_modify_appointment: true
     *         can_cancel_appointment: true
     *         can_view_customers: true
     *         can_manage_staff: true
     *         can_manage_services: true
     *         can_access_reports: true
     */


       /**
     * @swagger
     * /api/roles:
     *   post:
     *     summary: Create a new role
     *     tags: [Roles]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Role'
     *     responses:
     *       200:
     *         description: Role created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Role'
     *       500:
     *         description: Server error
     */

    // Create a new role
    app.post(`${apiPrefix}`, authenticateJWT, authorizeRoles(roles.ADMIN,),rolesController.create);

   /**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles with pagination
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           example: 1
 *         description: The page number to retrieve (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           example: 10
 *         description: The number of roles per page (default is 10)
 *     responses:
 *       200:
 *         description: List of roles with pagination
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
 *                   example: Retrieved all roles successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     roles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Role'
 *                     totalItems:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                 code:
 *                   type: integer
 *                   example: 200
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
 *                   example: Internal server error
 *                 data:
 *                   type: null
 *                 code:
 *                   type: integer
 *                   example: 500
 */

    // Get all roles
    app.get(`${apiPrefix}`, authenticateJWT, authorizeRoles(roles.ADMIN,),rolesController.findAll);

    /**
     * @swagger
     * /api/roles/{id}:
     *   get:
     *     summary: Get a role by ID
     *     tags: [Roles]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The ID of the role
     *     responses:
     *       200:
     *         description: The role by ID
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Role'
     *       404:
     *         description: Role not found
     *       500:
     *         description: Server error
     */
    // Get a single role by id
    app.get(`${apiPrefix}/:id`, rolesController.findOne);

     /**
     * @swagger
     * /api/roles/{id}:
     *   put:
     *     summary: Update a role by ID
     *     tags: [Roles]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The ID of the role to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Role'
     *     responses:
     *       200:
     *         description: Role updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Role'
     *       404:
     *         description: Role not found
     *       500:
     *         description: Server error
     */
    // Update a role by id
    app.put(`${apiPrefix}/:id`, authenticateJWT, authorizeRoles(roles.ADMIN),rolesController.update);  
};
