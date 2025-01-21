
// controllers/serviceController.js
const db = require("../models");
const Service = db.Service;
const sendResponse = require('../helpers/responseHelper'); // Make sure this path is correct
const { Op } = require('sequelize'); // Import Op for Sequelize operations

// Create a new service
exports.create = async (req, res) => {
    try {
        const { name, description,default_service_time, min_price, max_price, isActive } = req.body;


        // Check if a service with the same name already exists
        const existingService = await Service.findOne({ where: { name } });
        if (existingService) {
            return sendResponse(res, false, 'Service name is already taken', null, 400);
        }

        const service = await Service.create({
            name,
            description,
            default_service_time,
            min_price,
            max_price,
            isActive
        });

        sendResponse(res, true, 'Service created successfully', service, 201);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};

// Get all services
exports.findAll = async (req, res) => {
    try {
        const { search } = req.query; // Get the search query from the request

       // Define a filter condition based on the search query
       const whereCondition = search
       ? {
             name: {
                 [Op.iLike]: `%${search.split(' ').map(word => word.trim()).join('%')}%`, // Ensure each word is wrapped by '%'
             },
         }
       : {}; 
       // If no search term, return all services

        const services = await Service.findAll({
            where: whereCondition,
            order: [['createdAt', 'ASC']],
        });

        sendResponse(res, true, 'Services retrieved successfully', services, 200);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};

// Get a service by ID
exports.findOne = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);

        if (!service) {
            return sendResponse(res, false, 'Service not found', null, 404);
        }

        sendResponse(res, true, 'Service retrieved successfully', service, 200);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};

// Update a service by ID
exports.update = async (req, res) => {
    try {
        const { name, description,default_service_time, min_price , max_price, isActive } = req.body;
        const service = await Service.findByPk(req.params.id);

        if (!service) {
            return sendResponse(res, false, 'Service not found', null, 404);
        }

        service.name = name || service.name;
        service.description=description || service.description;
        service.default_service_time = default_service_time || service.default_service_time;
        service.min_price = min_price || service.min_price;
        service.max_price = max_price || service.max_price;
        service.isActive = isActive !== undefined ? isActive : service.isActive;

        await service.save();

        sendResponse(res, true, 'Service updated successfully', service, 200);
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
  


