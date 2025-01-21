// haircutDetails.routes.js
const express = require("express");
const haircutDetailsController = require("../controllers/haircutdetails.controller");
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const roles = require('../config/roles.config').role;

module.exports = app => {
    // API prefix for haircut details routes
    const apiPrefix = "/api/haircut-details";

    /**
     * @swagger
     * components:
     *   schemas:
     *     HaircutDetail:
     *       type: object
     *       required:
     *         - appointment_id
     *         - userId
     *         - customer_notes
     *         - haircut_style
     *         - product_used
     *         - barber_notes
     *       properties:
     *         id:
     *           type: integer
     *           description: Auto-generated haircut detail ID
     *         appointment_id:
     *           type: integer
     *           description: ID of the associated appointment
     *         user_id:
     *           type: integer
     *           description: ID of the user who received the haircut
     *         customer_notes:
     *           type: string
     *           description: Notes provided by the customer
     *         haircut_style:
     *           type: string
     *           description: Style of haircut performed
     *         product_used:
     *           type: string
     *           description: Products used during the haircut
     *         barber_notes:
     *           type: string
     *           description: Notes provided by the barber
     *       example:
     *         id: 1
     *         appointment_id: 101
     *         userId: 5
     *         customer_notes: "Please keep it short."
     *         haircut_style: "Fade"
     *         product_used: "Hair Gel"
     *         barber_notes: "Customer prefers a clean look."
     */

    /**
 * @swagger
 * /api/haircut-details:
 *   post:
 *     summary: Create a new haircut detail
 *     tags: [HaircutDetails]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointment_id:
 *                 type: integer
 *                 description: ID of the associated appointment
 *               customer_notes:
 *                 type: string
 *                 description: Notes provided by the customer
 *               haircut_style:
 *                 type: string
 *                 description: Style of haircut performed
 *               product_used:
 *                 type: string
 *                 description: Products used during the haircut
 *               barber_notes:
 *                 type: string
 *                 description: Notes provided by the barber
 *             required:
 *               - appointment_id
 *               - customer_notes
 *               - haircut_style
 *               - product_used
 *               - barber_notes
 *     responses:
 *       201:
 *         description: Haircut detail created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HaircutDetail'
 *       404:
 *         description: Appointment or User not found
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
    // Route to create a new haircut detail
    app.post(`${apiPrefix}`, authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER,roles.BARBER, roles.SALON_MANAGER),haircutDetailsController.create);

    /**
     * @swagger
     * /api/haircut-details:
     *   get:
     *     summary: Retrieve all haircut details
     *     tags: [HaircutDetails]
     *     responses:
     *       200:
     *         description: List of all haircut details
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/HaircutDetail'
     *       500:
     *         description: Server error
     */
    // Route to get all haircut details
    app.get(`${apiPrefix}`, haircutDetailsController.findAll);

    /**
     * @swagger
     * /api/haircut-details/{id}:
     *   get:
     *     summary: Get a haircut detail by ID
     *     tags: [HaircutDetails]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The ID of the haircut detail to retrieve
     *     responses:
     *       200:
     *         description: The haircut detail by ID
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HaircutDetail'
     *       404:
     *         description: Haircut detail not found
     *       500:
     *         description: Server error
     */
    // Route to get a haircut detail by ID
    app.get(`${apiPrefix}/:id`, haircutDetailsController.findOne);

    /**
     * @swagger
     * /api/haircut-details/{id}:
     *   put:
     *     summary: Update a haircut detail by ID
     *     tags: [HaircutDetails]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The ID of the haircut detail to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               customer_notes:
     *                 type: string
     *                 description: Updated notes provided by the customer
     *               haircut_style:
     *                 type: string
     *                 description: Updated style of haircut performed
     *               product_used:
     *                 type: string
     *                 description: Updated products used during the haircut
     *               barber_notes:
     *                 type: string
     *                 description: Updated notes provided by the barber
     *     responses:
     *       200:
     *         description: Haircut detail updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HaircutDetail'
     *       404:
     *         description: Haircut detail not found
     *       500:
     *         description: Server error
     */
    // Route to update a haircut detail by ID
    app.put(`${apiPrefix}/:id`, authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER,roles.BARBER, roles.SALON_MANAGER),haircutDetailsController.update);

    /**
     * @swagger
     * /api/haircut-details/{id}:
     *   delete:
     *     summary: Delete a haircut detail by ID
     *     tags: [HaircutDetails]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The ID of the haircut detail to delete
     *     responses:
     *       200:
     *         description: Haircut detail deleted successfully
     *       404:
     *         description: Haircut detail not found
     *       500:
     *         description: Server error
     */
    // Route to delete a haircut detail by ID
    app.delete(`${apiPrefix}/:id`,authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER,roles.BARBER, roles.SALON_MANAGER), haircutDetailsController.delete);
};
