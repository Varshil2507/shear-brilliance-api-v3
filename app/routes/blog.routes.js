const express = require("express");
const path = require("path");
const blogsController = require("../controllers/blog.controller");
const upload = require('../config/multer.config'); // Multer configuration for image uploads
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const roles = require('../config/roles.config').role;

module.exports = app => {
    const apiPrefix = "/api/blogs";

    /**
     * @swagger
     * components:
     *   schemas:
     *     Blog:
     *       type: object
     *       required:
     *         - title
     *         - description
     *       properties:
     *         id:
     *           type: integer
     *           description: Auto-generated blog ID
     *         title:
     *           type: string
     *           description: Title of the blog post
     *         description:
     *           type: string
     *           description: Description of the blog post
     *         image:
     *           type: string
     *           description: Path to the blog post image
     *       example:
     *         id: 1
     *         title: "First Blog Post"
     *         description: "This is the description of the first blog post."
     *         image: "uploads/blog_image.jpg"
     */

    /**
     * @swagger
     * /api/blogs:
     *   post:
     *     summary: Create a new blog post with an image
     *     tags: [Blogs]
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 description: Title of the blog post
     *               description:
     *                 type: string
     *                 description: Description of the blog post
     *               image:
     *                 type: string
     *                 format: binary
     *                 description: The blog post image
     *     responses:
     *       201:
     *         description: Blog created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Blog'
     *       500:
     *         description: Server error
     */
    // Route to create a new blog post with image upload
    app.post(`${apiPrefix}`, upload.single('image'),  authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER),blogsController.create);

    /**
     * @swagger
     * /api/blogs:
     *   get:
     *     summary: Retrieve all blog posts with pagination
     *     tags: [Blogs]
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
     *         description: The number of blog posts per page (default is 10)
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         required: false
     *         description: A search term to filter users by `title`. This parameter is case-insensitive and will match any of the fields.
     *         example: "title name"
     *     responses:
     *       200:
     *         description: List of blog posts with pagination
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
     *                   example: Fetched blogs successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     blogs:
     *                       type: array
     *                       items:
     *                         $ref: '#/components/schemas/Blog'
     *                     totalItems:
     *                       type: integer
     *                       example: 50
     *                     totalPages:
     *                       type: integer
     *                       example: 5
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
    // Route to get all blog posts
    app.get(`${apiPrefix}`, blogsController.findAll);

    /**
     * @swagger
     * /api/blogs/{id}:
     *   get:
     *     summary: Get a blog post by ID
     *     tags: [Blogs]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The ID of the blog post to retrieve
     *     responses:
     *       200:
     *         description: The blog post details by ID
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Blog'
     *       404:
     *         description: Blog not found
     *       500:
     *         description: Server error
     */
    // Route to get a blog post by ID
    app.get(`${apiPrefix}/:id`, blogsController.findOne);

    /**
     * @swagger
     * /api/blogs/{id}:
     *   put:
     *     summary: Update a blog post by ID with an image upload
     *     tags: [Blogs]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The ID of the blog post to update
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 description: Updated title of the blog post
     *               description:
     *                 type: string
     *                 description: Updated description of the blog post
     *               image:
     *                 type: string
     *                 format: binary
     *                 description: Updated image of the blog post
     *     responses:
     *       200:
     *         description: Blog updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Blog'
     *       404:
     *         description: Blog not found
     *       500:
     *         description: Server error
     */
    // Route to update a blog post by ID with an image
    app.put(`${apiPrefix}/:id`, upload.single('image'), authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER),blogsController.update);

    /**
     * @swagger
     * /api/blogs/{id}:
     *   delete:
     *     summary: Delete a blog post by ID
     *     tags: [Blogs]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The ID of the blog post to delete
     *     responses:
     *       200:
     *         description: Blog post deleted successfully
     *       404:
     *         description: Blog not found
     *       500:
     *         description: Server error
     */
    // Route to delete a blog post by ID
    app.delete(`${apiPrefix}/:id`, authenticateJWT, authorizeRoles(roles.ADMIN, roles.SALON_OWNER, roles.SALON_MANAGER), blogsController.delete);

    /**
     * @swagger
     * /api/blogs/images/{filename}:
     *   get:
     *     summary: Get an image by filename
     *     tags: [Blogs]
     *     parameters:
     *       - in: path
     *         name: filename
     *         schema:
     *           type: string
     *         required: true
     *         description: The filename of the image to retrieve
     *     responses:
     *       200:
     *         description: Image retrieved successfully
     *       404:
     *         description: Image not found
     */
    // Route to serve blog images by filename
    app.get(`${apiPrefix}/images/:filename`, (req, res) => {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../../uploads', filename);

        console.log(`Serving file from: ${filePath}`);

        res.sendFile(filePath, (err) => {
            if (err) {
                console.error(err);
                res.status(err.status).send({ message: "Image not found." });
            }
        });
    });
};
