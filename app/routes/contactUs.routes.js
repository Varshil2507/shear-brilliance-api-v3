const express = require('express');
const contactUsController = require('../controllers/contactUs.controller')
const path = require("path");


module.exports = (app) => {
    const apiPrefix = "/api/contact-us";

     // contact-us API

/**
 * @swagger
 * /api/contact-us:
 *   post:
 *     summary: Send a contact us message
 *     tags: [Contact Us]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the person sending the message
 *               subject:
 *                 type: string
 *                 description: Subject of the message
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the person sending the message
 *               message:
 *                 type: string
 *                 description: The message being sent
 *     responses:
 *       200:
 *         description: Message sent successfully
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
 *                   example: "Your message has been sent successfully!"
 *       400:
 *         description: Bad Request - Missing required fields or invalid data.
 *       500:
 *         description: Internal server error - An error occurred while sending the message.
 */
    app.post(`${apiPrefix}`, contactUsController.create);
}