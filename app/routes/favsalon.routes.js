const express = require("express");
const favoriteSalonsController = require("../controllers/favsalon.controller");
const { authenticateToken } = require('../middleware/authenticate.middleware'); // Adjust the path as needed

module.exports = (app) => {
  const apiPrefix = "/api/favorites";
 
  /**
   * @swagger
   * components:
   *   schemas:
   *     FavoriteSalon:
   *       type: object
   *       required:
   *         - UserId
   *         - SalonId
   *         - status
   *       properties:
   *         id:
   *           type: integer
   *           description: Auto-generated ID
   *         UserId:
   *           type: integer
   *           description: ID of the user who added the salon to favorites
   *         SalonId:
   *           type: integer
   *           description: ID of the salon added to favorites
   *         status:
   *           type: string
   *           enum: [like, dislike]
   *           description: Whether the salon is liked or disliked
   *         device_id:
   *           type: string
   *           description: Device ID for tracking purposes
   *       example:
   *         id: 1
   *         UserId: 1
   *         SalonId: 101
   *         status: like
   *         device_id: "device1234"
   */

  /**
   * @swagger
   * /api/favorites:
   *   post:
   *     summary: Add or update a salon to favorites (like or dislike)
   *     tags: [FavoriteSalons]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/FavoriteSalon'
   *     responses:
   *       201:
   *         description: Salon added to favorites
   *       200:
   *         description: Salon status updated
   *       500:
   *         description: Server error
   */
  app.post(`${apiPrefix}`, [authenticateToken],favoriteSalonsController.addOrUpdateFavoriteSalon);


  /**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get all favorite salons for a user by status (like or dislike)
 *     tags: [FavoriteSalons]
 *     parameters:
 *       - in: query
 *         name: UserId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [like, dislike]
 *         description: Filter by like or dislike status
 *     responses:
 *       200:
 *         description: List of favorite salons filtered by UserId and status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   favoriteId:
 *                     type: integer
 *                     description: ID of the favorite salon entry
 *                   UserId:
 *                     type: integer
 *                     description: ID of the user who liked/disliked the salon
 *                   SalonId:
 *                     type: integer
 *                     description: ID of the salon
 *                   isLiked:
 *                     type: boolean
 *                     description: Indicates if the salon is liked (true) or disliked (false)
 *       404:
 *         description: No favorite salons found for the specified user
 *       500:
 *         description: Server error
 */
app.get(`${apiPrefix}`, favoriteSalonsController.getAllFavorites);

};
