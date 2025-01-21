const express = require("express");

const { sendNotificationController,saveFcmToken } = require("../controllers/notification.controller");
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const roles = require('../config/roles.config').role;

module.exports = (app) => {
  const apiPrefix = "/api/notification";

  /**
   * @swagger
   * components:
   *   schemas:
   *     Notification:
   *       type: object
   *       required:
   *         - title
   *         - body
   *       properties:
   *         title:
   *           type: string
   *           description: The title of the notification
   *         body:
   *           type: string
   *           description: The body content of the notification
   *         image:
   *           type: string
   *           description: URL of the image to include in the notification
   *       example:
   *         title: "New Notification"
   *         body: "You have a new notification!"
   *         image: "https://example.com/image.jpg"
   */

  /**
   * @swagger
   * /api/notification:
   *   post:
   *     summary: Send a notification to all users with an optional image
   *     tags: [Notification]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: The title of the notification
   *                 example: "New Blog Post"
   *               body:
   *                 type: string
   *                 description: The body content of the notification
   *                 example: "Check out our new blog post!"
   *               image:
   *                 type: string
   *                 description: URL of the image to include in the notification
   *                 example: "https://example.com/image.jpg"
   *     responses:
   *       200:
   *         description: Notification sent successfully to all users
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
   *                   example: "Notification sent successfully to all users"
   *                 response:
   *                   type: string
   *                   example: "Notification ID from Firebase"
   *       400:
   *         description: Missing required fields (title, body)
   *       500:
   *         description: Failed to send notification
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
   *                   example: "Failed to send notification"
   *                 error:
   *                   type: string
   *                   example: "Error details"
   */
  app.post(`${apiPrefix}`,  authenticateJWT, authorizeRoles(roles.ADMIN,),sendNotificationController);



  /**
 * @swagger
 * /api/notification/save-fcm-token:
 *   post:
 *     summary: Save or update the FCM token for a user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The FCM token to be saved or updated
 *                 example: "dOq1Ex...f3k"
 *               deviceType:
 *                 type: string
 *                 description: The type of device (e.g., "android", "ios")
 *                 example: "android"
 *             required:
 *               - token
 *     responses:
 *       200:
 *         description: FCM token saved or updated successfully
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
 *                   example: "FCM token saved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     token:
 *                       type: string
 *                       example: "dOq1Ex...f3k"
 *                     device_type:
 *                       type: string
 *                       example: "android"
 *                     UserId:
 *                       type: integer
 *                       example: 123
 *       400:
 *         description: Missing userId or token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing userId or token"
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *       403:
 *         description: Forbidden - User does not have the required role
 *       500:
 *         description: Internal Server Error
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
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

  app.post(`${apiPrefix}/save-fcm-token`,  authenticateJWT, authorizeRoles(roles.ADMIN,roles.BARBER,roles.CUSTOMER,roles.SALON_MANAGER,roles.SALON_OWNER),saveFcmToken);

};
