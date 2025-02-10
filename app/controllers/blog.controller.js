const db = require("../models");
const Blog = db.Blog; // Ensure that this references your Blog model
const sendResponse = require('../helpers/responseHelper');  // Import the helper
const { put } = require('@vercel/blob'); // Assuming you are using the Vercel Blob API
const fs = require('fs'); // For handling file buffer
const { Op } = require("sequelize");
const AWS = require('aws-sdk');
const validateInput = require('../helpers/validatorHelper'); // Import the formatPrice function

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint('https://tor1.digitaloceanspaces.com'),
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

exports.create = async (req, res) => {
  try {
    let blogImage = null;
    let { title, description, htmlContent } = req.body;

    // Validate input
    const requiredFields = [
      { name: 'title', value: title, types: ['whitespace'] }, // Only check for non-empty title
      { name: 'description', value: description, types: ['whitespace'] }, // Only check for non-empty description
    ];

    for (const field of requiredFields) {
      if (field.value !== undefined) {
        for (const type of field.types) {
          if (!validateInput(field.value, type)) {
            return sendResponse(res, false, `Enter valid ${field.name}`, null, 400);
          }
        }
      }
    }

    if (req.file) {
      const params = {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: `blog-images/${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ACL: 'public-read',
        ContentType: req.file.mimetype,
      };

      try {
        const uploadResult = await s3.upload(params).promise();
        blogImage = uploadResult.Location;
      } catch (uploadError) {
        return sendResponse(res, false, 'Failed to upload image', null, 500);
      }
    }

    const blog = await Blog.create({
      title,
      description,
      image: blogImage,
      htmlContent
    });

    sendResponse(res, true, 'Blog created successfully', blog, 201);
  } catch (error) {
    console.error('Error creating blog:', error); // Log detailed error
    sendResponse(res, false, error.message || 'An error occurred', null, 500);
  }
};

 

exports.findAll = async (req, res) => {
  try {
    // Retrieve page, limit, and search from query parameters
    const { page = 1, limit = 10, search } = req.query;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Initialize where clause for filtering
    const blogFilter = {};

    // Add search functionality for title
    if (search) {
      blogFilter.title = { [Op.iLike]: `%${search}%` }; // Case-insensitive match for title
    }

    // Find blogs with pagination and filtering
    const { rows: blogs, count: totalItems } = await Blog.findAndCountAll({
      where: blogFilter, // Pass the filter here
      offset,
      limit,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    // Return response with pagination and filter info
    sendResponse(res, true, 'Fetched blogs successfully', {
      blogs,
      totalItems,
      totalPages,
      currentPage: page,
    }, 200);
  } catch (error) {
    sendResponse(res, false, error.message, null, 500);
  }
};



// Get a blog post by ID
exports.findOne = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      sendResponse(res, false, "Blog not found", null, 404);
    } else {
      sendResponse(res,  true, 'Fetched blog successfully', blog, 200);
    }
  } catch (error) {
    sendResponse(res, false, error.message, null, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const updates = { ...req.body };

    const requiredFields = [
      { name: 'title', value: updates.title, types: ['whitespace'] }, // Only check for non-empty title
      { name: 'description', value: updates.description, types: ['whitespace'] }, // Only check for non-empty description
    ];

    for (const field of requiredFields) {
      if (field.value !== undefined) {
        for (const type of field.types) {
          if (!validateInput(field.value, type)) {
            return sendResponse(res, false, `Enter valid ${field.name}`, null, 400);
          }
        }
      }
    }

    // Find the blog record
    const blog = await Blog.findOne({ where: { id: req.params.id } });
    if (!blog) {
      return sendResponse(res, false, "Blog not found", null, 404);
    }

    if (req.file) {
      const params = {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: `blog-images/${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ACL: 'public-read',
        ContentType: req.file.mimetype,
      };

      try {
        // Upload file to DigitalOcean Spaces
        const uploadResult = await s3.upload(params).promise();
        updates.image = uploadResult.Location;
      } catch (err) {
        return sendResponse(res, false, "Failed to upload image to DigitalOcean", err.message, 500);
      }
    } else {
      // Retain the existing image if no new file is uploaded
      updates.image = blog.image;
    }

     // Ensure htmlContent is retained if not provided
     if (!updates.htmlContent) {
      updates.htmlContent = blog.htmlContent;
    }

    // Update the blog post in the database
    const [updatedRows] = await Blog.update(updates, {
      where: { id: req.params.id },
    });

    if (updatedRows === 0) {
      sendResponse(res, false, "No changes made to the blog", null, 400);
    } else {
      sendResponse(res, true, "Blog updated successfully", null, 200);
    }
  } catch (error) {
    sendResponse(res, false, error.message, null, 500);
  }
};


// Delete a blog post by ID
exports.delete = async (req, res) => {
  try {
    const result = await Blog.destroy({ where: { id: req.params.id } });
    if (result === 1) {
      sendResponse(res, true, "Blog deleted successfully", null, 200);
    } else {
      sendResponse(res, false, "Blog not found", null, 404);
    }
  } catch (error) {
    sendResponse(res, false, error.message, null, 500);
  }
};
