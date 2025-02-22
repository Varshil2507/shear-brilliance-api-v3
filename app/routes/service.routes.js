const servicesController = require("../controllers/service.contoller");
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const roles = require('../config/roles.config').role;

module.exports = (app) => {
    const apiPrefix = "/api/services";


    
    /**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - default_service_time
 *               - min_price
 *               - max_price
 *               - isActive
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the service
 *               description:
 *                 type: string
 *                 description: A detailed description of the service
 *               default_service_time:
 *                 type: integer
 *                 description: Estimated service time in minutes
 *               min_price:
 *                 type: number
 *                 format: double
 *                 description: Minimum price for the service (in dollars)
 *               max_price:
 *                 type: number
 *                 format: double
 *                 description: Maximum price for the service (in dollars)
 *               isActive:
 *                 type: boolean
 *                 description: Indicates if the service is currently active
 *             example:
 *               name: "Haircut"
 *               description: "A stylish haircut for both men and women."
 *               default_service_time: 30
 *               min_price: 10.99
 *               max_price: 15.99
 *               isActive: true
 *     responses:
 *       201:
 *         description: Service created successfully
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
 *                   description: Response message
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     default_service_time:
 *                       type: integer
 *                     min_price:
 *                       type: number
 *                       format: double
 *                     max_price:
 *                       type: number
 *                       format: double
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 code:
 *                   type: integer
 *                   description: HTTP status code
 *       400:
 *         description: Service name already exists or invalid input
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
 *                   description: Error message
 *                 code:
 *                   type: integer
 *                   description: HTTP status code
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
 */


// Create a new service
    app.post(`${apiPrefix}`, authenticateJWT, authorizeRoles(roles.ADMIN,roles.SALON_OWNER, roles.SALON_MANAGER), servicesController.create);

    /**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search query to filter services by name
 *     responses:
 *       200:
 *         description: List of services
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
 *                   description: Response message
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       default_service_time:
 *                         type: integer
 *                       min_price:
 *                         type: number
 *                         format: double
 *                       max_price:
 *                         type: number
 *                         format: double
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 code:
 *                   type: integer
 *       500:
 *         description: Server error
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
 *                   description: Error message
 *                 code:
 *                   type: integer
 */

    // Get all services
    app.get(`${apiPrefix}`, servicesController.findAll);

    /**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get a service by ID
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the service to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service found
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
 *                   description: Response message
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     default_service_time:
 *                       type: integer
 *                     min_price:
 *                       type: number
 *                       format: double
 *                     max_price:
 *                       type: number
 *                       format: double
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 code:
 *                   type: integer
 *       404:
 *         description: Service not found
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
 *                   description: Error message
 *                 code:
 *                   type: integer
 *       500:
 *         description: Server error
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
 *                   description: Error message
 *                 code:
 *                   type: integer
 */

    // Get a service by ID
    app.get(`${apiPrefix}/:id`, authenticateJWT, servicesController.findOne);


 /**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Update a service by ID
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the service to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the service
 *               description:
 *                 type: string
 *                 description: A detailed description of the service
 *               default_service_time:
 *                 type: integer
 *                 description: Estimated wait time for the service in minutes
 *               min_price:
 *                 type: number
 *                 format: double
 *                 description: Minimum price for the service (in dollars)
 *               max_price:
 *                 type: number
 *                 format: double
 *                 description: Maximum price for the service (in dollars)
 *               isActive:
 *                 type: boolean
 *                 description: The active status of the service
 *             example:
 *               name: "Haircut"
 *               description: "A stylish haircut for both men and women."
 *               default_service_time: 30
 *               min_price: 10.99
 *               max_price: 15.99
 *               isActive: true
 *     responses:
 *       200:
 *         description: Service updated successfully
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
 *                   description: Response message
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     default_service_time:
 *                       type: integer
 *                     min_price:
 *                       type: number
 *                     max_price:
 *                       type: number
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 code:
 *                   type: integer
 *                   description: HTTP status code
 *       400:
 *         description: Invalid input or bad request
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
 *                   description: Error message
 *                 code:
 *                   type: integer
 *                   description: HTTP status code
 *       404:
 *         description: Service not found
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
 *                   description: Error message
 *                 code:
 *                   type: integer
 *                   description: HTTP status code
 *       500:
 *         description: Server error
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
 *                   description: Error message
 *                 code:
 *                   type: integer
 *                   description: HTTP status code
 */

    // Update a service by ID
    app.put(`${apiPrefix}/:id`, authenticateJWT, authorizeRoles(roles.ADMIN,roles.SALON_OWNER, roles.SALON_MANAGER), servicesController.update);

    
    /**
     * @swagger
     * /api/services/{id}/status:
     *   patch:
     *     summary: Update the 'isActive' status of a service
     *     tags: [Services]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: The ID of the service
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               isActive:
     *                 type: boolean
     *                 description: The active status of the service
     *     responses:
     *       200:
     *         description: Service status updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Service'
     *       400:
     *         description: Invalid input
     *       404:
     *         description: Service not found
     *       500:
     *         description: Server error
     */
    app.patch(`${apiPrefix}/:id/status`, authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER), servicesController.updateIsActive);
};
