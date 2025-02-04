
// controllers/serviceController.js
const db = require("../models");
const Service = db.Service;
const sendResponse = require('../helpers/responseHelper'); // Make sure this path is correct
const { Op } = require('sequelize'); // Import Op for Sequelize operations
const validateInput = require('../helpers/validatorHelper'); // Import the formatPrice function


function formatPrice(value) {
    if (value === null || value === undefined) return null;

    // Convert the value to a float and fix it to 2 decimal places
    const numValue = parseFloat(value);

    // Check if the value is a valid number
    if (isNaN(numValue)) {
        throw new Error('Invalid price format');
    }

    // Return the value formatted to 2 decimal places
    return parseFloat(numValue.toFixed(2));
}


exports.create = async (req, res) => {
    try {
        const { name, description, default_service_time, min_price, max_price, isActive } = req.body;

        if (!name || !description || !default_service_time || !min_price || !max_price) {
            return sendResponse(res, false, 'All fields are required', null, 400);
        }

         // Whitespace validation for required fields
        const requiredFields = [
            { name: 'name', value: name },
            { name: 'description', value: description },
        ];

        for (const field of requiredFields) {
            if (!validateInput(field.value, 'whitespace')) {
              return sendResponse(res, false, `Enter valid  ${field.name}`, null, 400);
            }
        }    
        
        // Validation checks...
        if (!name) {
            return sendResponse(res, false, 'Name is required', null, 400);
        }

        // Check for existing service...
        const existingService = await Service.findOne({ where: { name } });
        if (existingService) {
            return sendResponse(res, false, 'Service name is already taken', null, 400);
        }


        if (min_price !== undefined && (isNaN(min_price) || min_price < 0)) {
            return sendResponse(res, false, 'Invalid min_price value', null, 400);
        }
        
        if (max_price !== undefined && (isNaN(max_price) || max_price < 0)) {
            return sendResponse(res, false, 'Invalid max_price value', null, 400);
        }
        
        if (min_price !== undefined && max_price !== undefined && min_price > max_price) {
            return sendResponse(res, false, 'min_price cannot be greater than max_price', null, 400);
        }

        // Format prices before saving
        const formattedMinPrice = formatPrice(min_price);
        const formattedMaxPrice = formatPrice(max_price);

        // Create the service
        const service = await Service.create({
            name,
            description,
            default_service_time,
            min_price: formattedMinPrice,
            max_price: formattedMaxPrice,
            isActive
        });

        sendResponse(res, true, 'Service created successfully', service, 201);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};

// Update Service
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, default_service_time, min_price, max_price, isActive } = req.body;

         // Whitespace validation for required fields
         const requiredFields = [
            { name: 'name', value: name },
            { name: 'description', value: description },
        ];

        for (const field of requiredFields) {
            if (!validateInput(field.value, 'whitespace')) {
              return sendResponse(res, false, `Enter valid  ${field.name}`, null, 400);
            }
        }    
        
        // Find the service by ID
        const service = await Service.findByPk(id);
        if (!service) {
            return sendResponse(res, false, 'Service not found', null, 404);
        }

        if (min_price !== undefined && (isNaN(min_price) || min_price < 0)) {
            return sendResponse(res, false, 'Invalid min_price value', null, 400);
        }
        
        if (max_price !== undefined && (isNaN(max_price) || max_price < 0)) {
            return sendResponse(res, false, 'Invalid max_price value', null, 400);
        }
        
        if (min_price !== undefined && max_price !== undefined && min_price > max_price) {
            return sendResponse(res, false, 'min_price cannot be greater than max_price', null, 400);
        }

        // Format prices before updating
        const formattedMinPrice = min_price !== undefined ? formatPrice(min_price) : null;
        const formattedMaxPrice = max_price !== undefined ? formatPrice(max_price) : null;

        // Update service fields
        await service.update({
            name: name || service.name,
            description: description || service.description,
            default_service_time: default_service_time || service.default_service_time,
            min_price: formattedMinPrice !== null ? formattedMinPrice : service.min_price,
            max_price: formattedMaxPrice !== null ? formattedMaxPrice : service.max_price,
            isActive: isActive !== undefined ? isActive : service.isActive,
        });

        sendResponse(res, true, 'Service updated successfully', service, 200);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};


exports.findAll = async (req, res) => {
    try {
        const { search } = req.query;

        // Build the search condition
        const whereCondition = search
            ? {
                name: {
                    [Op.iLike]: `%${search.split(' ').map(word => word.trim()).join('%')}%`,
                },
            }
            : {};

        // Fetch all services with the search condition
        const services = await Service.findAll({
            where: whereCondition,
            order: [['createdAt', 'ASC']],
        });

        // Format the response data for all services
        const formattedServices = services.map(service => ({
            ...service.toJSON(),
            min_price: service.min_price ? parseFloat(service.min_price).toFixed(2) : null,
            max_price: service.max_price ? parseFloat(service.max_price).toFixed(2) : null,
        }));

        sendResponse(res, true, 'Services retrieved successfully', formattedServices, 200);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};

// Get a service by ID
exports.findOne = async (req, res) => {
    try {
        // Find the service by ID
        const service = await Service.findByPk(req.params.id);

        if (!service) {
            return sendResponse(res, false, 'Service not found', null, 404);
        }

        // Format the response data
        const responseData = {
            ...service.toJSON(),
            min_price: service.min_price ? parseFloat(service.min_price).toFixed(2) : null,
            max_price: service.max_price ? parseFloat(service.max_price).toFixed(2) : null,
        };

        sendResponse(res, true, 'Service retrieved successfully', responseData, 200);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};


exports.updateIsActive = async (req, res) => {
    try {
      const { id } = req.params; // Extract service ID from URL parameters
      const { isActive } = req.body; // Extract isActive from request body
  
      // Validate if isActive is provided and is a valid boolean value
      if (typeof isActive !== 'boolean') {
        return sendResponse(res, false, 'isActive status must be a boolean', null, 400);
      }
  
      // Find the service by ID
      const service = await Service.findByPk(id);
      
      if (!service) {
        return sendResponse(res, false, 'Service not found', null, 404);
      }
  
      // Update the isActive field
      service.isActive = isActive;
  
      // Save the updated service
      await service.save();
  
      // Send a response with the updated service
      return sendResponse(res, true, 'Service updated successfully', service, 200);
    } catch (error) {
      console.error('Error updating service:', error);
      return sendResponse(res, false, 'An error occurred while updating the service.', null, 500);
    }
  };