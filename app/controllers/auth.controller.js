// Required dependencies
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require("../models");  // Importing models
const secretKey = require('../config/jwt.config').secret; // JWT secret key
const { body, validationResult } = require('express-validator');
const sendResponse = require('../helpers/responseHelper');  // Import the helper
const sgMail = require("@sendgrid/mail"); // sendgrid Mail
const { response } = require('express');
const crypto = require('crypto');
// Models
const User = db.USER;
const roles = db.roles;
const barber = db.Barber;
const salon = db.Salon;
const UserSalon =db.UserSalon;
const { sendPasswordResetEmail } = require('../services/emailService');
const { PasswordResetToken } = require('../models');
const{role}=require('../config/roles.config');
const fs = require('fs');


// Function to verify the Google token
async function verifyGoogleToken(token) {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?access_token='+token, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const googleUser = await response.json();
    return googleUser; // Return the user data
  } catch (error) {
    // Handle errors in the token exchange
    console.error('Token exchange error:', error);
    throw new Error('Internal Server Error'); // Throw an error to be caught in googleLogin
  }
}

// Google One-Tap login
exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const googleUser = await verifyGoogleToken(token);
    
    // Find the user in the database by email
    let user = await User.findOne({ where: { email: googleUser.email } });

    const userRole = await roles.findOne({ where: { role_name:role.CUSTOMER } });
    if (!userRole) {
      return sendResponse(res, false,"User role not found", null, 404);
    }

    const userRoleId = userRole.id; // Get the ID of the user role

    // If user doesn't exist, create a new one
    if (!user) {
      user = await User.create({
        username: googleUser.email.split('@')[0], // Use the part before '@' for username
        firstname: googleUser.given_name,
        lastname: googleUser.family_name,
        email: googleUser.email,
        google_token :token,
        profile_photo : googleUser.picture,
        password:"google",
        RoleId : userRoleId
      });
    }

    // Generate a JWT token for session management
    const jwtToken = jwt.sign({ id: user.id, email: user.email, role: role.CUSTOMER }, secretKey, { expiresIn: '365d' });

    return sendResponse(res, true, 'Google login successful', { user, token: jwtToken });
  } catch (error) {
    return sendResponse(res, false, 'Invalid Google token', null, 400);
  }
};


// Replace these with your actual values
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID; // Found in your Apple Developer account
const APPLE_KEY_ID = process.env.APPLE_KEY_ID; // Found in the Keys section of the Apple Developer Portal
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID; // The Service ID you created (e.g., com.example.myapp.service)
const APPLE_PRIVATE_KEY_PATH = "./secrets/AuthKey_8VVN9UYTU2.p8"; // Path to your downloaded .p8 file

// Function to generate the Apple Client Secret (JWT)
const generateAppleClientSecret = () => {
  const privateKey = fs.readFileSync(APPLE_PRIVATE_KEY_PATH, 'utf8');

  const token = jwt.sign(
    {
      iss: APPLE_TEAM_ID, // Issuer: Your Apple Team ID
      iat: Math.floor(Date.now() / 1000), // Issued at: Current time
      exp: Math.floor(Date.now() / 1000) + 3600, // Expiration: 1 hour from now
      aud: 'https://appleid.apple.com', // Audience: Apple ID URL
      sub: APPLE_CLIENT_ID, // Subject: Your Service ID
    },
    privateKey,
    {
      algorithm: 'ES256', // Algorithm: Elliptic Curve
      keyid: APPLE_KEY_ID, // Key ID: Your Key ID
    }
  );

  return token;
};

// Function to verify the Apple token and fetch user info
const verifyAppleToken = async (token) => {
  try {
    // Generate the client secret
    const APPLE_CLIENT_SECRET = generateAppleClientSecret();

    // Make the request to Apple's token endpoint
    const response = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: new URLSearchParams({
        client_id: APPLE_CLIENT_ID,
        client_secret: APPLE_CLIENT_SECRET,
        code: token,
        grant_type: 'authorization_code',
        redirect_uri: "https://shearbrilliance.orioniktechnologies.com/"
      }),
    });

    // if (!response.ok) {
    //   throw new Error('Failed to verify Apple token');
    // }

    const tokenResponse = await response.json();
    if (!tokenResponse.id_token) {
      throw new Error('ID Token missing in response');
    }

    // Decode the ID token to extract user information
    const decodedToken = jwt.decode(tokenResponse.id_token);
    return decodedToken; // Contains user info like email, etc.
  } catch (error) {
    console.error('Apple token verification error:', error);
    throw new Error('Internal Server Error');
  }
};

// Apple login API
exports.appleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const appleUser = await verifyAppleToken(token);

    // Extract user data from the Apple response
    const { email, sub: appleId } = appleUser;

    // Find the user in the database by email or Apple ID
    let user = await User.findOne({ where: { email } });

    const userRole = await roles.findOne({ where: { role_name: role.CUSTOMER } });
    if (!userRole) {
      return sendResponse(res, false, "User role not found", null, 404);
    }

    const userRoleId = userRole.id;

    let firstname = "Apple";
    let lastname = "User";

    // If user doesn't exist, create a new one
    if (!user) {
      user = await User.create({
        username: email.split('@')[0], // Use the part before '@' for username
        firstname: "Apple",
        lastname: "User",
        email: email,
        google_token :"",
        apple_token:appleId,
        profile_photo : "",
        password:"apple",
        RoleId : userRoleId
      });
    }

    // Generate a JWT token for session management
    const jwtToken = jwt.sign({ id: user.id, email: user.email, role: role.CUSTOMER }, secretKey, { expiresIn: '365d' });

    return sendResponse(res, true, 'Apple login successful', { user, token: jwtToken });
  } catch (error) {
    return sendResponse(res, false, 'Invalid Apple token', null, 400);
  }
};


// Register User with role
exports.register = async (req, res) => {
  try {
    const { firstname, lastname, address, mobile_number, email, password, role_name, profile_photo } = req.body;

    // Check for missing required fields
    if (!firstname || !lastname || !address || !mobile_number || !email || !password || !role_name) {
      return sendResponse(res, false, "All fields are required", null, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendResponse(res, false, "Enter Valid Email Id", null, 400);
    }

    // Validate mobile number format (example validation for 10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile_number)) {
      return sendResponse(res, false, "Invalid mobile number format. It should be 10 digits.", null, 400);
    }

    // Check if the user already exists by email
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return sendResponse(res, false, "Email already exists", null, 400);
    }

    // Fetch RoleId based on the role_name (role_name is passed in the request body)
    const role = await roles.findOne({ where: { role_name } });
    if (!role) {
      return sendResponse(res, false, "Invalid Role Name", null, 400);
    }

    // Get the RoleId from the fetched role
    const RoleId = role.id;  // The ID of the role corresponding to role_name

    // Automatically generate a unique username
    let baseUsername = `${firstname.toLowerCase()}_${lastname.toLowerCase()}`;
    let username = baseUsername;
    let userWithSameUsername = await User.findOne({ where: { username } });

    let counter = 1;
    while (userWithSameUsername) {
      username = `${baseUsername}${counter}`;
      userWithSameUsername = await User.findOne({ where: { username } });
      counter++;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with RoleId stored in the database
    const user = await User.create({
      username,
      firstname,
      lastname,
      address,
      mobile_number,
      email,
      password: hashedPassword,
      RoleId, // Store the RoleId (ID from the roles table)
      profile_photo,
    });

    // Return the response with role_name if needed for reference
    return sendResponse(res, true, "User registered successfully", {
      ...user.toJSON(),
      role_name: role.role_name, // Optionally include role_name in response
    }, 201);
  } catch (error) {
    console.error("Registration Error:", error);
    const errorMessage = error.name === 'SequelizeValidationError'
      ? error.errors.map(err => err.message)
      : error.message;
    return sendResponse(res, false, errorMessage, null, 500);
  }
};

// Login users for role id 
exports.login = async (req, res) => {
  try {
    // Validation checks
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, false, "Validation error", errors.array(), 400);
    }

    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: roles, // Role model
          as: 'role',  // Optional alias
          attributes: ['id', 'role_name'] // Fetch role details
        }
      ]
    });

    if (!user) {
      return sendResponse(res, false, "User not found", null, 200);
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return sendResponse(res, false, "Invalid password", null, 200);
    }

    let barberId = null;
    let salonId = null;
    let berberData = null;
    let categoryType = null;

    if(user.role.role_name == role.BARBER){
      const barberRole = await barber.findOne({ 
        where: { UserId: user.id },
        attributes: ['id', 'name', 'category', 'position', 'availability_status', 'photo', 'SalonId'] // Include required fields
      });
      
      if (barberRole) {
        barberId = barberRole.id;
        berberData = barberRole;
        // Map category number to string
        categoryType = barberRole.category === 1 ? 'Appointment_Barber' : 'WalkIn_Barber';
      }
    }
    let salonData = null; 
    if(user.role.role_name == role.SALON_OWNER){
      const salonRole = await salon.findOne({ where: { UserId: user.id } });
      salonId = salonRole.id;
      salonData = salonRole;
      categoryType = role.SALON_OWNER;
    }
    if(user.role.role_name == role.SALON_MANAGER){
      const userSalon = await UserSalon.findOne({ where: { UserId: user.id } });
      if (userSalon) {
        const salonRole = await salon.findOne({ where: { id: userSalon.SalonId } });
        salonId = salonRole.id;
        salonData = salonRole;
        categoryType = role.SALON_MANAGER;
      }
    }
    if (user.role.role_name === role.ADMIN) {
      // Handle Admin-specific logic here if needed
      categoryType = role.ADMIN; // Set category type for Admin
    }



    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role.role_name,barberId:barberId ,salonId:salonId, categoryType: categoryType}, secretKey, {
      expiresIn: '365d'
    });

    // Remove password field before returning the user object
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;
    return sendResponse(res, true, "Login successful", { user: userWithoutPassword, token,salon:salonData,berber:berberData, categoryType: categoryType });

  } catch (error) {
    console.error("Login Error:", error);
    // Handle different types of errors based on their origin
    return sendResponse(res, false, "Internal server error", error.message, 500);
  }
};

// Register users with the default "user" role
exports.registerUser = async (req, res) => {
  try {
    // Validation checks
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, false, "Validation error", errors.array(), 400);
    }

    const { firstname, lastname, email, password } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return sendResponse(res, false, "Enter Valid Email", null, 400);
    }

    // Auto-generate username from first and last name
    const username = `${firstname}_${lastname}_${Math.floor(1000 + Math.random() * 9000)}`; // Adding random number for uniqueness

    // Check if the user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return  sendResponse(res, false, "Email already exists", "An account with this email already exists. Please use a different email.", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find the default user role
    const userRole = await roles.findOne({ where: { role_name: role.CUSTOMER } });
    if (!userRole) {
      return sendResponse(res, false, "User role not found", "The default user role could not be found in the system. Please contact support.", 500);
    }

    // Create a new user with the default role
    const user = await User.create({
      username,
      firstname,
      lastname,
      email,
      password: hashedPassword,
      RoleId: userRole.id  // Assign default "user" role
    });

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user.get({ plain: true });

    // Generate a JWT token
    const token = jwt.sign({ id: userWithoutPassword.id, email: userWithoutPassword.email,role: role.CUSTOMER }, secretKey, { expiresIn: '365d' });

    return sendResponse(res, true, "User registered successfully", { user: userWithoutPassword, token }, 201);
  } catch (error) {
    console.error("Registration Error:", error);

    // Check for specific errors (e.g., Sequelize errors)
    if (error.name === "SequelizeValidationError") {
      return sendResponse(res, false, "Validation Error", error.errors.map(e => e.message), 400);
    }

    // Handle other types of errors (e.g., unexpected database or server errors)
    return sendResponse(res, false, "Error registering user", error.message, 500);
  }
};

// Login customer with role verification
exports.loginUser = async (req, res) => {
  try {
    // Validation checks
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, false, "Validation error", errors.array(), 400);
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: roles, // Role model
          as: 'role',  // Optional alias
          attributes: ['id', 'role_name'] // Fetch role details
        }
      ]
    });

    if (!user) {
      return sendResponse(res, false, "User not found", "No account with this email exists", 404);
    }

    // Check if the user's role is 'customer'
    if (user.role.role_name !== role.CUSTOMER) {
      return sendResponse(res, false, "Unauthorized", "Only customers can log in", 403);
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return sendResponse(res, false, "Invalid password", "The password you entered is incorrect", 401);
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role.role_name }, secretKey, {
      expiresIn: '365d'
    });

    // Remove password before sending the response
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    return sendResponse(res, true, "Login successful", { token, user: userWithoutPassword }, 200);
  } catch (error) {
    console.error("Login Error:", error);
    // Handle database and other errors
    return sendResponse(res, false, "Error logging in", error.message, 500);
  }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) return res.status(200).json({ message: "If the email exists, you'll receive a reset link" });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
    
    await PasswordResetToken.create({ userId: user.id, token, expiresAt });
    await sendPasswordResetEmail(email, token);

    return res.status(200).json({ message: "If the email exists, you'll receive a reset link" });
};

exports.resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) return res.status(400).json({ message: "Invalid request" });

    const resetToken = await PasswordResetToken.findOne({ where: { userId: user.id, token } });
    if (!resetToken || resetToken.expiresAt < new Date()) {
        return res.status(400).json({ message: "Token expired or invalid" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await PasswordResetToken.destroy({ where: { userId: user.id } });
    return res.status(200).json({ message: "Password reset successfully" });
};

// Get a user by ID
exports.userInfo = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    if(userId){
      const user = await User.findByPk(userId);
      if (!user) {
        return sendResponse(res, false, "User not found", null, 404);
      }
       // Exclude password from the response
       const { password: _, ...userWithoutPassword } = user.get({ plain: true });
      sendResponse(res, true, "User retrieved successfully", userWithoutPassword, 200);
    }
    else{
      sendResponse(res, false, "User not found", null, 200);
    }
   
  } catch (error) {
    sendResponse(res, false, error.message, "Error retrieving user", 500);
  }
};