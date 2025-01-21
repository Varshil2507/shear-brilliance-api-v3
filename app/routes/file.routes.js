const express = require('express');
const { getImage } = require('../controllers/file.controller');
const path = require("path");

const router = express.Router();

module.exports = app => {
    const apiPrefix = "/images/:filename";

    /**
     * @swagger
     * /images/{filename}:
     *   get:
     *     summary: Retrieve an image by filename
     *     description: Fetches an image from the uploads directory by filename.
     *     parameters:
     *       - name: filename
     *         in: path
     *         required: true
     *         description: The name of the image file to retrieve.
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Image retrieved successfully.
     *         content:
     *           image/png:
     *             schema:
     *               type: string
     *               format: binary
     *       404:
     *         description: Image not found.
     *       500:
     *         description: Error fetching image.
     */
    app.get(`${apiPrefix}`, getImage);
};
