const db = require("../models");
const Barber = db.Barber;
const Salon =db.Salon;
const User =db.USER;
const BarberLeave = db.BarberLeave;
const Appointment =db.Appointment;
const BarberSession=db.BarberSession;
const Slot =db.Slot;
const sendResponse = require('../helpers/responseHelper');
const { sendEmail } = require("../services/emailService");
const { INVITE_APPROVED_LEAVE_TEMPLATE_ID } = require("../config/sendGridConfig");
const{role}= require('../config/roles.config');
const { Sequelize } = require('sequelize');
const { fn, col, Op } = require('sequelize');

// Create a leave request
exports.createLeave = async (req, res) => {
  try {
    // Extract BarberId from the token (assuming it's set in req.user by middleware)
    const BarberId = req.user?.barberId;

    if (!BarberId) {
      return sendResponse(res, false, 'Barber ID is missing from the token.', null, 401);
    }

    const { availability_status, start_time, end_time, start_date,end_date, reason } = req.body;

    // Basic validation
    if (!availability_status || !start_date ||  !end_date || !reason) {
      return sendResponse(res, false, 'Availability status, date, and reason are required.', null, 400);
    }

    // If availability_status is 'available', ensure start_time and end_time are provided
    if (availability_status === 'available' && (!start_time || !end_time)) {
      return sendResponse(res, false, 'Start time and End time are required when availability status is "available".', null, 400);
    }

    // If availability_status is 'unavailable', start_time and end_time should not be passed
    if (availability_status === 'unavailable' && (start_time || end_time)) {
      return sendResponse(res, false, 'Start time and End time should not be provided when availability status is "unavailable".', null, 400);
    }

    // Try to create the leave request
    const newLeave = await BarberLeave.create({
      BarberId,
      availability_status,
      start_time: start_time || null,
      end_time: end_time || null,
      start_date,
      end_date,
      reason
    });

    return sendResponse(res, true, 'Leave request created successfully.', newLeave, 201);

  } catch (error) {
    // Log the full error object for debugging
    console.error('Error creating leave request:', error);

    // Handle specific error types
    if (error.name === 'SequelizeValidationError') {
      return sendResponse(res, false, `Validation error: ${error.errors.map(e => e.message).join(', ')}`, null, 400);
    }

    // If the error is related to database issues, return a specific message
    if (error.name === 'SequelizeDatabaseError') {
      return sendResponse(res, false, 'Database error occurred while creating the leave request.', null, 500);
    }

    // Handle any other error types
    return sendResponse(res, false, 'An unknown error occurred while creating the leave request.', null, 500);
  }
};



// Get all leave requests for a barber by calendar-selected date
exports.getLeavesByBarber = async (req, res) => {
  try {
    const { barberId } = req.user; // Extract barberId from the token
    const { start_date, end_date, status, search, page = 1, limit = 10 } = req.query; // Extract pagination parameters (default to page 1 and limit 10)

    if (!barberId) {
      return sendResponse(res, false, 'Unauthorized access. Barber ID not found in token.', null, 401);
    }

    // Validate status if provided
    const validStatuses = ['approved', 'pending', 'denied'];
    if (status && !validStatuses.includes(status.toLowerCase())) {
      return sendResponse(res, false, 'Invalid status value. Allowed values: approved, pending, denied.', null, 400);
    }

    // Validate page and pageSize
    const currentPage = parseInt(page, 10);
    const currentPageSize = parseInt(limit, 10);
    if (isNaN(currentPage) || currentPage <= 0) {
      return sendResponse(res, false, 'Invalid page number.', null, 400);
    }
    if (isNaN(currentPageSize) || currentPageSize <= 0) {
      return sendResponse(res, false, 'Invalid page size.', null, 400);
    }

    let whereClause = { BarberId: barberId };

    // Add start_date and end_date filters
    if (start_date || end_date) {
      const startDate = start_date ? new Date(start_date) : null;
      const endDate = end_date ? new Date(end_date) : null;

      if (startDate && isNaN(startDate.getTime())) {
        return sendResponse(res, false, 'Invalid start_date format. Use YYYY-MM-DD.', null, 400);
      }

      if (endDate && isNaN(endDate.getTime())) {
        return sendResponse(res, false, 'Invalid end_date format. Use YYYY-MM-DD.', null, 400);
      }

      // Apply the date range filter
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate.setHours(0, 0, 0, 0)); // Start of the day
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate.setHours(23, 59, 59, 999)); // End of the day
    }

    // Add status filter
    if (status) {
      whereClause.status = status.toLowerCase();
    }

    // Filter by search query (barber name)
    if (search) {
      whereClause['$barber.name$'] = {
        [Op.iLike]: `%${search}%`, // Case-insensitive search for the barber's name
      };
    }

    // Calculate offset and limit for pagination
    const offset = (currentPage - 1) * currentPageSize;

    const leaves = await BarberLeave.findAndCountAll({
      where: whereClause,
      include: [
        { model: Barber, as: 'barber', include: [{ model: Salon, as: 'salon' }, { model: User, as: 'user' }] },
      ],
      order: [['createdAt', 'DESC']], // Order by start_date in descending order 
      limit: currentPageSize,  // Number of records per page
      offset: offset, // Skip records for pagination
    });

    if (!leaves || leaves.count === 0) {
      return sendResponse(res, true, 'No leaves found.', [], 200);
    }

    // Include pagination details in the response
    const totalPages = Math.ceil(leaves.count / currentPageSize);
    const pagination = {
      currentPage,
      totalPages,
      totalItems: leaves.count,
    };

    return sendResponse(res, true, 'Leaves fetched successfully.', {
      leaves: leaves.rows,
      pagination,
    }, 200);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return sendResponse(
      res,
      false,
      'An unexpected error occurred while fetching the leaves.',
      null,
      500
    );
  }
};






exports.getAllLeaves = async (req, res) => {
  try {
    const { start_date, end_date, status,search, page = 1, pageSize = 10 } = req.query;

    // Validate status if provided
    const validStatuses = ['approved', 'pending', 'denied'];
    if (status && !validStatuses.includes(status.toLowerCase())) {
      return sendResponse(res, false, 'Invalid status value. Allowed values: approved, pending, denied.', null, 400);
    }

    // Validate page and pageSize
    const currentPage = parseInt(page, 10);
    const currentPageSize = parseInt(pageSize, 10);
    if (isNaN(currentPage) || currentPage <= 0) {
      return sendResponse(res, false, 'Invalid page number.', null, 400);
    }
    if (isNaN(currentPageSize) || currentPageSize <= 0) {
      return sendResponse(res, false, 'Invalid page size.', null, 400);
    }

    // Build the query filter
    let filters = {};

    // Default filter: if no status is provided, only show 'pending' status
    if (status) {
      filters.status = status.toLowerCase();
    }

      // Filter by search query (barber name)
      if (search) {
        filters['$barber.name$'] = {
          [Op.iLike]: `%${search}%`, // Case-insensitive search for the barber's name
        };
      }

    // Filter by date range
    if (start_date || end_date) {
      const startDate = start_date ? new Date(start_date) : null;
      const endDate = end_date ? new Date(end_date) : null;

      if (startDate && isNaN(startDate.getTime())) {
        return sendResponse(res, false, 'Invalid start_date format. Use YYYY-MM-DD.', null, 400);
      }

      if (endDate && isNaN(endDate.getTime())) {
        return sendResponse(res, false, 'Invalid end_date format. Use YYYY-MM-DD.', null, 400);
      }

      // Apply the date range filter
      filters.createdAt = {};
      if (startDate) filters.createdAt[Op.gte] = new Date(startDate.setHours(0, 0, 0, 0));
      if (endDate) filters.createdAt[Op.lte] = new Date(endDate.setHours(23, 59, 59, 999));
    }

    // If salon manager (e.g., user role is salon manager), filter by salon
    if (req.user.role === role.SALON_MANAGER) {
      filters['$barber.SalonId$'] = req.user.salonId; // Assuming you have a salonId associated with the user
    }

    // Fetch leave requests with the applied filters and pagination
    const leaves = await BarberLeave.findAndCountAll({
      where: filters,
      include: [
        {
          model: Barber,
          as: 'barber',
          include: [
            { model: Salon, as: 'salon' },
            { model: User, as: 'user' },
          ],
          where: search
          ? {
              name: {
                [Op.iLike]: `%${search}%`, // Case-insensitive search for the barber's name
              },
            }
          : undefined,
      },
      ],
      order: [['createdAt', 'DESC']], // Order by start_date in descending order
      limit: currentPageSize,
      offset: (currentPage - 1) * currentPageSize,
    });

    if (!leaves.rows || leaves.rows.length === 0) {
      return sendResponse(res, true, 'No leave requests found.', [], 200);
    }

    // Enhanced logic for fetching appointments and slots
    for (const leave of leaves.rows) {
      const barber = leave.barber;
      if (barber) {

        const startDate = new Date(leave.start_date).toISOString().split('T')[0];
        const endDate = new Date(leave.end_date).toISOString().split('T')[0];

        // Fetch appointments for this barber
        const appointments = await Appointment.findAll({
          where: {  
             BarberId: barber.id, status: 'appointment',appointment_date: {
              [Sequelize.Op.gte]: startDate,
              [Sequelize.Op.lte]: endDate }, 
            }
        });

        for (const appointment of appointments) {
          if (appointment.SlotId) {
            // Fetch slot details using SlotId
            const slot = await Slot.findOne({
              where: { id: appointment.SlotId },
              attributes: ['start_time', 'end_time'],
            });

            if (slot) {
              // Attach slot start and end times to the appointment
              appointment.dataValues.slot_start_time = slot.start_time;
              appointment.dataValues.slot_end_time = slot.end_time;
            }
          }
        }

        // Attach appointments to the barber object
        barber.dataValues.appointments = appointments;
      }
    }

    // Calculate total number of pages
    const totalPages = Math.ceil(leaves.count / currentPageSize);

    // Pagination metadata
    const pagination = {
      currentPage,
      totalItems: leaves.count,
      totalPages,
    };

    return sendResponse(
      res,
      true,
      'All leave requests fetched successfully.',
      {
        leaves: leaves.rows,
        pagination,
      },
      200
    );
  } catch (error) {
    console.error('Error fetching all leave requests:', error);
    return sendResponse(
      res,
      false,
      'An unexpected error occurred while fetching all leave requests.',
      null,
      500
    );
  }
}



// Update leave status by salon manager/owner
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response_reason } = req.body;

    // Validate the status
    if (!['approved', 'denied'].includes(status)) {
      return sendResponse(res, false, 'Invalid status. Valid statuses are: approved, denied.', null, 400);
    }

    // Ensure response_reason is provided if status is denied
    if (status === 'denied' && !response_reason) {
      return sendResponse(res, false, 'Response reason is required when status is denied.', null, 400);
    }

    // Ensure the user is a salon manager
    if (req.user.role !== role.SALON_MANAGER) {
      return sendResponse(res, false, 'Unauthorized. Only salon managers can update leave status.', null, 403);
    }

    // Fetch the salon ID directly from the token
    const salonId = req.user.salonId;

    if (!salonId) {
      return sendResponse(res, false, 'Salon ID not found in the token.', null, 400);
    }

    const user = await db.USER.findByPk(req.user.id);

    // Fetch the leave request and associated barber details
    const leave = await BarberLeave.findByPk(id, {
      include: {
        model: Barber,
        as: 'barber',
        attributes: ['id', 'SalonId'],
      },
    });

    const barber = await db.Barber.findOne({id:leave.BarberId});
    const Barberemail = await db.USER.findOne({ where: { id: leave.BarberId }, attributes: ['email'] });
    const email = Barberemail ? Barberemail.email : 'NA';
    
    const salon = await db.Salon.findOne({ where: { id: salonId } });
    const salonName = salon ? salon.name : 'NA';

    
    if (!leave) {
      return sendResponse(res, false, 'Leave request not found.', null, 404);
    }

    // Extract start_time, end_time, and availability_status from BarberLeave
    const { start_time, end_time, availability_status } = leave;

    // Update leave status and approve_by_id
    leave.status = status;
    if (status === 'denied') {
      leave.response_reason = response_reason;
    }
    leave.approve_by_id = req.user.id;
    await leave.save();

    // Handle session logic only if the leave is approved
    if (status === 'approved') {
      if (availability_status === 'unavailable') {
        // Find barber sessions matching the leave's start_time (session_date) before deleting
        const barberSessions = await BarberSession.findAll({
          where: {
            BarberId: leave.barber.id,
            SalonId: salonId,
            session_date: leave.start_date,
          },
        });

        if (barberSessions.length > 0) {
          barberSessions.forEach((session) => {
            console.log(`Deleting BarberSession with ID: ${session.id}`);
          });

          // Delete the sessions
          await BarberSession.destroy({
            where: {
              BarberId: leave.barber.id,
              SalonId: salonId,
              session_date: leave.start_date,
            },
          });

          console.log(`Barber sessions deleted for Barber ID ${leave.barber.id} and Salon ID ${salonId}.`);
        } else {
          console.log(`No BarberSession found for Barber ID ${leave.barber.id} on the specified date.`);
        }
      } else if (availability_status === 'available') {
        // Ensure start_time and end_time exist
        if (!start_time || !end_time) {
          return sendResponse(
            res,
            false,
            'Start time and End time are required when availability status is "available".',
            null,
            400
          );
        }

        const leaveStartDate = new Date(leave.start_date);

        if (isNaN(leaveStartDate)) {
          throw new Error('Invalid date format for leave.start_time.');
        }

        // Find the barber session that matches the leave's start_time (session_date)
        const barberSession = await BarberSession.findOne({
          where: {
            BarberId: leave.barber.id,
            SalonId: salonId,
            [Op.and]: [
              Sequelize.where(fn('DATE', col('session_date')), leaveStartDate.toISOString().split('T')[0]),
            ],
          },
        });

        if (barberSession) {
          barberSession.start_time = start_time;
          barberSession.end_time = end_time;
          await barberSession.save();
          console.log(`Barber session updated with new start and end times for Barber ID ${leave.barber.id}.`);
        } else {
          console.log(
            `No existing session found for Barber ID ${leave.barber.id} on the specified date. Skipping creation as per requirement.`
          );
        }
      }
    }

    // Send email notification to the barber
    const emailData = {
      Barber_name: barber.name,
      start_date: leave.start_date,
      end_date: leave.end_date,
      status: leave.status,
      response_reason: leave.response_reason || 'N/A',
      location:salonName, // Replace with the salon's name if available
      salon_manager_name:user.username,
      currentYear: new Date().getFullYear(),
      email_subject:  'Leave Request Status',
    };

    await sendEmail(email,'Leave Request Status', INVITE_APPROVED_LEAVE_TEMPLATE_ID, emailData);

    return sendResponse(res, true, `Leave status updated to ${status}.`, leave, 200);
  } catch (error) {
    console.error('Error updating leave status:', error);
    return sendResponse(res, false, 'An error occurred while updating the leave status.', null, 500);
  }
};


