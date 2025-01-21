const db = require("../models");
const HaircutDetails = db.HaircutDetails;
const Appointment = db.Appointment; // Import the Appointment model
const User = db.USER; // Import the User model
const sendResponse = require("../helpers/responseHelper"); // Import sendResponse helper


// Create a new haircut detail
exports.create = async (req, res) => {
    try {
        const { appointment_id, customer_notes, haircut_style, product_used, barber_notes } = req.body;

        // Validate if appointment exists and fetch associated user_id
        const appointment = await Appointment.findByPk(appointment_id);
        if (!appointment) {
            return sendResponse(res, false, "Appointment not found", null, 404);
        }

        const user_id = appointment.UserId; // Fetch user_id from Appointment table

        // Validate if user exists
        const user = await User.findByPk(user_id);
        if (!user) {
            return sendResponse(res, false, "User not found", null, 404);
        }

        // Create the haircut detail
        const haircutDetail = await HaircutDetails.create({
            AppointmentId: appointment_id,
            UserId: user_id,
            customer_notes,
            haircut_style,
            product_used,
            barber_notes,
        });

        sendResponse(res, true, "Haircut detail created successfully", haircutDetail, 201);
    } catch (error) {
        sendResponse(res, false, error.message, null, 400);
    }
};


// Get all haircut details
exports.findAll = async (req, res) => {
    try {
        const haircutDetails = await HaircutDetails.findAll({
            include: [
                {
                    model: Appointment,
                    as: 'appointment',
                    attributes: ['id', 'status'], // Include related appointment data
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username'] // Include related user data (if required)
                }
            ]
        });

        sendResponse(res, true, "Retrieved all haircut details successfully", haircutDetails, 200);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};

// Get a haircut detail by ID
exports.findOne = async (req, res) => {
    try {
        const haircutDetail = await HaircutDetails.findByPk(req.params.id, {
            include: [
                {
                    model: Appointment,
                    attributes: ['id', 'status'] // Include related appointment data
                },
                {
                    model: User,
                    attributes: ['id', 'username'] // Include related user data
                }
            ]
        });

        if (!haircutDetail) {
            return sendResponse(res, false, "Haircut detail not found", null, 404);
        }

        sendResponse(res, true, "Haircut detail retrieved successfully", haircutDetail, 200);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};

// Update a haircut detail by ID
exports.update = async (req, res) => {
    try {
        const haircutDetail = await HaircutDetails.findByPk(req.params.id);
        if (!haircutDetail) {
            return sendResponse(res, false, "Haircut detail not found", null, 404);
        }

        // Update fields based on request body
        const { customer_notes, haircut_style, product_used, barber_notes } = req.body;

        if (customer_notes !== undefined) haircutDetail.customer_notes = customer_notes;
        if (haircut_style !== undefined) haircutDetail.haircut_style = haircut_style;
        if (product_used !== undefined) haircutDetail.product_used = product_used;
        if (barber_notes !== undefined) haircutDetail.barber_notes = barber_notes;

        await haircutDetail.save();
        sendResponse(res, true, "Haircut detail updated successfully", haircutDetail, 200);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};

// Delete a haircut detail by ID
exports.delete = async (req, res) => {
    try {
        const haircutDetail = await HaircutDetails.findByPk(req.params.id);
        if (!haircutDetail) {
            return sendResponse(res, false, "Haircut detail not found", null, 404);
        }

        await haircutDetail.destroy();
        sendResponse(res, true, "Haircut detail deleted successfully", null, 200);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};
