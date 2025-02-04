const db = require("../models");
const User = db.USER; // Ensure that this references your User model
const bcrypt = require("bcrypt"); // For password hashing
const { Op } = require('sequelize'); // Make sure to import Op for Sequelize operators
const { Sequelize, DataTypes } = require('sequelize');
const Role = db.roles;
const Salon = db.Salon;
const Barber = db.Barber;
const Appointment = db.Appointment;
const HaircutDetails = db.HaircutDetails;
const UserSalon =db.UserSalon;
const FavoriteSalon = db.FavoriteSalon;
const fs = require('fs');
const path = require('path'); // Make sure path is imported
const { put } = require('@vercel/blob'); // Import 'put' directly if using Vercel's blob SDK upload method
const sendResponse = require('../helpers/responseHelper');  // Import the helper
const crypto = require('crypto');
const { apiKey, RESET_PASSWORD_TEMPLATE_ID } = require('../config/sendGridConfig');
const { sendEmail } = require("../services/emailService");
const { INVITE_CUSTOMER_TEMPLATE_ID } = require("../config/sendGridConfig");
const { role} = require('../config/roles.config');
const AWS = require('aws-sdk');
const validateInput = require('../helpers/validatorHelper');


// Configure S3 for DigitalOcean Spaces
const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint('https://tor1.digitaloceanspaces.com'),
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
   region: "tor1-1"
});



exports.create = async (req, res) => {
  try {

    const { firstname, lastname, email, address, mobile_number, password } = req.body;

    // Validate the input fields
    const requiredFields = [
      { name: 'firstname', value: firstname },
      { name: 'lastname', value: lastname },
      { name: 'address', value: address },
      { name: 'email', value: email },
      { name: 'mobile_number', value: mobile_number },
      { name: 'password', value: password }
    ];

     // Validate required fields (skip password if not being updated)
      for (const field of requiredFields) {
        if (field.value !== undefined) {
            // Use specific validation for address
            if (field.name === 'address') {
                if (!validateInput(field.value, 'address')) {
                    return sendResponse(res, false, `Enter valid ${field.name}`, null, 400);
                }
            } else {
                // General whitespace validation for other fields
                if (!validateInput(field.value, 'whitespace')) {
                    return sendResponse(res, false, `Enter valid ${field.name}`, null, 400);
                }
            }
        }
      }

    if(!validateInput(firstname, 'nameRegex')) {
      return sendResponse(res, false, 'Firstname must contain only letters', null, 400);
    }

    if(!validateInput(lastname, 'nameRegex')) {
      return sendResponse(res, false, 'Lastname must contain only letters', null, 400);
    }

    if (!validateInput(email, 'email')) {
      return sendResponse(res, false, 'Invalid email', 'Please provide a valid email address', 400);
    }

    if (!validateInput(password, 'password')) {
      return sendResponse(res, false, 'Invalid password', 
        'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters', 
        400
      );
    }

    if (!validateInput(mobile_number, 'mobile_number')) {
      return sendResponse(res, false, 'Invalid mobile number', 'Please provide a valid mobile number', 400);
    }

     // Check if the email already exists
     const existingUser = await User.findOne({ where: { email: req.body.email } });
     if (existingUser) {
       return sendResponse(res, false, 'Email already exists', 'Duplicate email', 400);
     }
     
    // Hash the password using bcrypt with 10 salt rounds
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Handle profile photo if uploaded
    let profilePhoto = null; // Default to null if no file is uploaded

    if (req.file) {
      const params = {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: `profile-photos/${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ACL: 'public-read',
        ContentType: req.file.mimetype,
      };

      try {
        // Upload file to DigitalOcean Spaces
        const uploadResult = await s3.upload(params).promise();
        profilePhoto = uploadResult.Location; // Use the uploaded file URL
      } catch (err) {
        return sendResponse(res, false, 'Failed to upload profile photo', err.message, 500);
      }
    }

    // Automatically generate a unique username based on the first and last name
    const baseUsername = `${req.body.firstname.toLowerCase()}_${req.body.lastname.toLowerCase()}`;
    let username = baseUsername;
    let userWithSameUsername = await User.findOne({ where: { username } });

    let counter = 1;
    while (userWithSameUsername) {
      // Append a number to the username if a user with the same name already exists
      username = `${baseUsername}${counter}`;
      userWithSameUsername = await User.findOne({ where: { username } });
      counter++;
    }

    // Create the user in the database with the auto-generated username
    const user = await User.create({
      username, // Automatically set the username
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      address: req.body.address,
      mobile_number: req.body.mobile_number,
      email: req.body.email,
      password: hashedPassword, // Save the hashed password
      profile_photo: profilePhoto, // Save the URL of the profile photo
      RoleId: req.body.RoleId, // Assign the RoleId
    });

    // Check if the role exists
    const roleData = await Role.findByPk(req.body.RoleId);
    if (!roleData) {
      return sendResponse(res, false, 'Role not found', 'Invalid RoleId', 400);
    }

    // If the user is a Salon Manager, add them to the UserSalon junction table
    if (roleData.role_name === role.SALON_MANAGER) {
      if (!req.body.SalonId) {
        return sendResponse(res, false, 'SalonId is required for Salon Managers', 'Invalid input', 400);
      }

      try {
        // Insert into UserSalon table only for Salon Managers
        await UserSalon.create({
          UserId: user.id,
          SalonId: req.body.SalonId,
        });
      } catch (error) {
        console.error('Error inserting into UserSalon:', error);
        return sendResponse(res, false, 'Failed to associate user with salon', error.message, 500);
      }
    }

    // Prepare email data for SendGrid
    const customerEmailData = {
      email: req.body.email,
      company_name: 'Shear_Brilliance',
      currentYear: new Date().getFullYear()
    };

    // Send confirmation email to the customer
    await sendEmail(req.body.email, 'Added as a Customer', INVITE_CUSTOMER_TEMPLATE_ID, customerEmailData);

    // Send the success response
    sendResponse(res, true, 'User created successfully', user, 201);
  } catch (error) {
    // In case of an error, send the error message
    sendResponse(res, false, error.message, 'Error creating user', 500);
  }
};

// Find users by filters (salon ID and role ID)
exports.findByFilters = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const userRole = await Role.findOne({ where: { role_name: role.CUSTOMER } });
    if (!userRole) {
      return sendResponse(res, false, "Customer role not found", null, 404);
    }

    const userRoleIdToExclude = userRole.id; // Get the ID of the user role
    const offset = (page - 1) * limit;

    const filter = {
      RoleId: {
        [Op.ne]: userRoleIdToExclude, // Exclude users with the "user" role
      },
    };

    //if (salonId) filter.SalonId = salonId; // Filter by salonId

    const users = await User.findAndCountAll({
      where: filter,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Role, as: 'role' }
      ],
    });

    const totalPages = Math.ceil(users.count / limit);

    sendResponse(res, true, {
      totalItems: users.count,
      totalPages,
      currentPage: page,
      users: users.rows,
    }, "Users retrieved successfully", 200);
  } catch (error) {
    console.error(error);
    sendResponse(res, false, error.message, "Server error", 404);
  }
};

// Get all users with role-based filtering
exports.getAllUsers = async (req, res) => {
  const { page = 1, limit = 10, type = 'customer', search } = req.query;
  const offset = (page - 1) * limit;

  try {
    let filter = {};
    const userRole = req.user.role;

    if (userRole === role.SALON_OWNER || userRole === role.SALON_MANAGER) {
      const appointments = await Appointment.findAll({
        where: { SalonId: req.user.salonId },
        attributes: ['UserId'],
        group: ['UserId'],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const userIds = appointments.map(app => app.UserId);

      if (userIds.length === 0) {
        return sendResponse(res, true, "No users found for the salon", {
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          users: [],
        }, 200);
      }

      filter.id = userIds;

      const totalUsers = await Appointment.count({
        where: { SalonId: req.user.salonId },
        distinct: true,
        col: 'UserId',
      });

      const totalPages = Math.ceil(totalUsers / limit);

      const users = await User.findAndCountAll({
        where: filter,
        include: [{ model: Role, as: "role", attributes: ['id', 'role_name'] }],
      });

      return sendResponse(res, true, "Users retrieved successfully", {
        totalItems: totalUsers,
        totalPages,
        currentPage: parseInt(page),
        users: users.rows,
      }, 200);
    }

    let roleIds;
    if (type === 'user') {
      const userRoles = await Role.findAll({
        where: { role_name: [role.SALON_OWNER, role.BARBER, role.SALON_MANAGER] },
        attributes: ['id']
      });
      roleIds = userRoles.map(role => role.id);
    } else {
      const customerRole = await Role.findOne({ where: { role_name: role.CUSTOMER } });
      if (!customerRole) {
        return sendResponse(res, false, "Customer role not found", null, 404);
      }
      roleIds = [customerRole.id];
    }

    filter.RoleId = roleIds;

    const searchConditions = [];

    if (search) {
      searchConditions.push(
        { firstname: { [Sequelize.Op.iLike]: `%${search}%` } },
        { lastname: { [Sequelize.Op.iLike]: `%${search}%` } },
        { email: { [Sequelize.Op.iLike]: `%${search}%` } },
        { '$User.username$': { [Sequelize.Op.iLike]: `%${search}%` } },
      );
      searchConditions.push(
        Sequelize.literal(`"role"."role_name" ILIKE '%${search}%'`)
      );
    }

    if (searchConditions.length > 0) {
      filter[Sequelize.Op.or] = searchConditions;
    }

    const result = await User.findAndCountAll({
      where: filter,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: Role, as: "role", attributes: ['id', 'role_name'] }]
    });

    // Process each user to add salon information if they're a salon manager
    const processedUsers = await Promise.all(result.rows.map(async (user) => {
      const userData = user.toJSON();
      
      if (userData.role && userData.role.role_name === role.SALON_MANAGER) {
        const userSalon = await UserSalon.findOne({ where: { UserId: user.id } });
        if (userSalon) {
          const salon = await Salon.findOne({ where: { id: userSalon.SalonId } });
          if (salon) {
            userData.salonId = salon.id;
            userData.salonData = salon;
          }
        }
      }
      return userData;
    }));

    const totalPages = Math.ceil(result.count / limit);

    sendResponse(res, true, "Users retrieved successfully", {
      totalItems: result.count,
      totalPages,
      currentPage: parseInt(page),
      users: processedUsers,
    }, 200);
  } catch (error) {
    console.error("Error fetching users:", error);
    sendResponse(res, false, error.message, null, 500);
  }
};




exports.findOne = async (req, res) => {
  try {
    const { role: userRole, id: loggedInUserId  } = req.user; // Extract role and IDs from token
    const userId = parseInt(req.params.id);

    if (!userId) {
      return sendResponse(res, false, "User ID is required", null, 400);
    }

    let whereCondition = { id: userId }; // Default condition: fetch by userId
    let salonId = null; // Placeholder for salon ID
    let salonData = null; // Placeholder for salon data

    // Role-specific logic
    if (userRole === role.CUSTOMER) {
      if (parseInt(userId) !== parseInt(customerId)) {
        return sendResponse(
          res,
          false,
          "Customers can only access their own data",
          null,
          403
        );
      }
    }else if (userRole === role.SALON_MANAGER) {
      // Fetch the salon associated with the Salon Manager
      const userSalon = await UserSalon.findOne({ where: { UserId: loggedInUserId } });
      if (!userSalon) {
        return sendResponse(
          res,
          false,
          "Salon Manager does not have an associated salon",
          null,
          403
        );
      }

      const salonRole = await Salon.findOne({ where: { id: userSalon.SalonId } });
      if (!salonRole) {
        return sendResponse(res, false, "Salon not found for the Salon Manager", null, 404);
      }

      salonId = salonRole.id; // Assign salon ID
      salonData = salonRole; // Save salon data
    } else if (![role.BARBER, role.SALON_OWNER, role.ADMIN].includes(userRole)) {
      return sendResponse(res, false, "Unauthorized access", null, 403);
    }

    console.log("Query whereCondition:", whereCondition); // Debug log

    // Fetch user details
    const user = await User.findOne({
      where: whereCondition,
      attributes: { exclude: ["password"] }, // Exclude sensitive data like password
    });

    if (!user) {
      return sendResponse(res, false, "User not found", null, 404);
    }

    // Build appointment filter
    const appointmentFilter = { UserId: user.id };

    if (userRole === role.SALON_MANAGER && salonId) {
      // Filter appointments by the Salon ID of the logged-in manager
      appointmentFilter["$salon.id$"] = salonId;
    }

    // Fetch appointments with related data
    const appointments = await Appointment.findAll({
      where: appointmentFilter,
      attributes: [
        "id",
        "number_of_people",
        "status",
        "estimated_wait_time",
        "queue_position",
        "mobile_number",
        "name",
        "check_in_time",
        "in_salon_time",
        "complete_time",
        "cancel_time",
        "appointment_date",
        "appointment_start_time",
        "appointment_end_time"
      
      ],
      include: [
        { model: Barber, as: "Barber", attributes: ["name", "background_color"] },
        { model: Salon, as: "salon", attributes: ["id","name"] },
      ],
      order: [["check_in_time", "DESC"]], // Order by check-in time
    });

   // Fetch haircut details for each appointment
    const appointmentsWithHaircutDetails = await Promise.all(
      appointments.map(async (appointment) => {
        // Fetch the haircut details based on AppointmentId, not UserId
        const haircutDetails = await HaircutDetails.findAll({
          where: { AppointmentId: appointment.id }, // Match by AppointmentId
        });

        // Attach haircut details to the appointment
        appointment.dataValues.haircutDetails = haircutDetails;
        return appointment;
      })
    );

    // Attach enriched appointments to the user object
    user.dataValues.appointments = appointmentsWithHaircutDetails;

    // Return the user details along with enriched appointments and salon data
    const responsePayload = {
      user,
      salon: salonData, // Include salon information for managers
    };

    // Return the user details along with enriched appointments
    return sendResponse(
      res,
      true,
      "User and related details retrieved successfully",
      responsePayload,
      200
    );
    
  } catch (error) {
    console.error("Error retrieving user details:", error);
    return sendResponse(res, false, "Error retrieving user details", null, 500);
  }
};



exports.update = async (req, res) => {
  try {
    // Fetch the current user data
    const userId = req.params.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return sendResponse(res, false, "User not found", null, 404);
    }

    // Check if the user role is 'customer' and if the user is trying to update their own data
    if (req.user.role == role.CUSTOMER && req.user.id != userId) {
      return sendResponse(res, false, 'Unauthorized: You can only update your own profile.', null, 403);
    }

    const updates = { ...req.body };

    const requiredFields = [
      { name: 'firstname', value: updates.firstname },
      { name: 'lastname', value: updates.lastname },
      { name: 'address', value: updates.address },
      { name: 'mobile_number', value: updates.mobile_number },
    ]

    // Validate required fields
    for (const field of requiredFields) {
      if (field.value !== undefined) {
        // Use specific validation for address
        if (field.name === 'address') {
          if (!validateInput(field.value, 'address')) {
            return sendResponse(res, false, `Enter valid ${field.name}`, null, 400);
          }
        } else {
          // General whitespace validation for other fields
          if (!validateInput(field.value, 'whitespace')) {
            return sendResponse(res, false, `Enter valid ${field.name}`, null, 400);
          }
        }
      }
    }

    // Validate firname and lastname
    if (!validateInput(updates.firstname, 'nameRegex')) {
      return sendResponse(res, false, 'Firstname must contain only letters', null, 400);
    }

    if (!validateInput(updates.lastname, 'nameRegex')) {
      return sendResponse(res, false, 'Lastname must contain only letters', null, 400);
    }

    // Retain the existing email and username
    updates.email = user.email;
    updates.username = user.username;
    updates.RoleId = user.RoleId;

    // If a new file is uploaded, upload it to DigitalOcean Spaces
    if (req.file) {
      const params = {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: `profile-photos/${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ACL: 'public-read',
        ContentType: req.file.mimetype,
      };

      try {
        // Upload file to DigitalOcean Spaces
        const uploadResult = await s3.upload(params).promise();
        updates.profile_photo = uploadResult.Location; // Use the uploaded file URL
      } catch (err) {
        return sendResponse(res, false, 'Failed to upload profile photo', err.message, 500);
      }
    } else {
      // Retain the existing profile photo
      updates.profile_photo = user.profile_photo;
    }

    // Automatically fetch and set RoleId from the existing user
    updates.RoleId = updates.RoleId ? updates.RoleId : user.RoleId; // Use existing RoleId
     updates.email = user.email;


    // Update the user record
    const [updated] = await User.update(updates, {
      where: { id: userId },
    });

    if (updated === 0) {
      return sendResponse(res, false, "No change made to the user", null);
    }

    sendResponse(res, true, "User updated successfully", updates, 200);
  } catch (error) {
    sendResponse(res, false, error.message, "Error updating user");
  }
};
 
// Delete a user by ID
exports.delete = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the user role is 'customer' and if the user is trying to update their own data
    if (req.user.role == role.CUSTOMER && req.user.id != userId) {
      return sendResponse(res, false, 'Unauthorized: You can only update your own profile.', null, 403);
    }

    // Find the user by ID
    const user = await User.findByPk(userId);

    if (!user) {
      return sendResponse(res, false, "User not found", null, 404);
    }

    // Remove related records from FavoriteSalons
    await FavoriteSalon.destroy({ where: { UserId: userId } });

    // Delete related appointments and haircut details manually if not using cascading
    const appointments = await Appointment.findAll({ where: { UserId: userId } });

    for (const appointment of appointments) {
      // Delete related haircut details for each appointment
      await HaircutDetails.destroy({ where: { AppointmentId: appointment.id } });
    }

    // Delete appointments
    await Appointment.destroy({ where: { UserId: userId } });

    // Delete the user
    await User.destroy({ where: { id: userId } });

    return sendResponse(res, true, "User and related data deleted successfully", null, 200);
  } catch (error) {
    console.error("Error deleting user:", error);
    return sendResponse(res, false, "Error deleting user", error.message, 500);
  }
};
// Generate a unique reset token
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Send password reset email
exports.sendResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if a user exists with the provided email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return sendResponse(res, false, "User not found with this email", null, 404);
    }

    // Generate reset token and expiry (1 hour)
    const resetToken = generateResetToken();
    const resetTokenExpiry = Date.now() + 3600000;

    // Save reset token and expiry in the user record
    await user.update({
      reset_token: resetToken,
      reset_token_expiry: resetTokenExpiry,
    });

    // Create the reset link with the token
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Prepare email data for reset password email
    const resetEmailData = { resetLink };

    // Send the reset password email using the common sendEmail function
    await sendEmail(email, "Reset your password", RESET_PASSWORD_TEMPLATE_ID, resetEmailData);

    
    // Send success response
    return sendResponse(res, true, 'Password reset link has been sent to your email', null, 200);
  } catch (error) {
    console.error('Error sending reset email:', error);
    return sendResponse(res, false, 'Error sending reset email', null, 500);
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find the user with the matching reset token and check if it's still valid
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: {   [Op.gt]: Date.now(), },  // Ensure token is not expired
      },
    });

    if (!user) {
      return sendResponse(res, false, "Invalid or expired reset token", null, 200);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and remove the reset token fields
    await user.update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expiry: null,
    });

    // Send success response
    return sendResponse(res, true, "Password has been successfully updated", null, 200);
  } catch (error) {
    console.error('Error resetting password:', error);
    return sendResponse(res, false, 'Error resetting password', null, 500);
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;  // Assuming you have user ID from authentication middleware

  try {
    // Find the user by their ID
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return sendResponse(res, false, "User not found", null, 200);
    }
 
    // Check if the old password matches the user's current password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return sendResponse(res, false, "Old password is incorrect", null, 200);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await user.update({ password: hashedPassword });

    // Send success response
    return sendResponse(res, true, "Password has been successfully changed", null, 200);
  } catch (error) {
    console.error("Error changing password:", error);
    return sendResponse(res, false, "Error changing password", null, 500);
  }
};

// update user by Patch API
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params; // Extract userId from URL parameters
    const { firstname, lastname, mobile_number, address } = req.body;

    // Check if the user role is 'customer' and if the user is trying to update their own data
    if (req.user.role == role.CUSTOMER && req.user.id != id) {
      return sendResponse(res, false, 'Unauthorized: You can only update your own profile.', null, 403);
    }

    // Validate required fields
    if (!firstname && !lastname && !mobile_number && !address && !req.file) {
      return sendResponse(res, false, 'No fields provided to update.', null, 400);
    }

    // Find the user by ID
    const user = await User.findByPk(id);
    if (!user) {
      return sendResponse(res, false, 'User not found', null, 404);
    }

    // Prepare fields for update
    const updatedFields = {};

    if (firstname) updatedFields.firstname = firstname;
    if (lastname) updatedFields.lastname = lastname;
    if (mobile_number) updatedFields.mobile_number = mobile_number;
    if (address) updatedFields.address = address;

    // Check if a new profile photo is provided
    if (req.file) {
      const params = {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: `profile-photos/${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ACL: 'public-read',
        ContentType: req.file.mimetype,
      };

      try {
        // Upload file to DigitalOcean Spaces
        const uploadResult = await s3.upload(params).promise();
        updatedFields.profile_photo = uploadResult.Location; // Update to new profile photo URL
      } catch (err) {
        return sendResponse(res, false, 'Failed to upload profile photo', err.message, 500);
      }
    } else {
      updatedFields.profile_photo = user.profile_photo; // Retain the existing photo
    }

    // Update the user with the provided fields
    await user.update(updatedFields);

    return sendResponse(res, true, 'User updated successfully', { user }, 200);
  } catch (error) {
    console.error('Error updating user:', error);
    return sendResponse(res, false, 'An error occurred while updating the user.', null, 500);
  }
};