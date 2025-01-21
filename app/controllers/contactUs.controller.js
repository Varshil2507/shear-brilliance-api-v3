// controllers/contactUs.controller.js
const { CONTACT_US_TEMPLATE_ID,CONTACT_US_MAIL } = require("../config/sendGridConfig");
const { sendEmail } = require("../services/emailService");
const sendResponse = require('../helpers/responseHelper');

exports.create = async (req, res) => {
  try {
    // Destructure and validate required fields
    const { name, subject, email, message } = req.body;

    if (!name || !subject || !email || !message) {
      return sendResponse(res, false, 'All fields are required', null, 400);
    }

    // Prepare email data for SendGrid
    const contactUsData = {
      name,
      subject,
      email,
      message
    };

    await sendEmail(CONTACT_US_MAIL, "contact_us API", CONTACT_US_TEMPLATE_ID, contactUsData)

    return sendResponse(res, true, 'Your message has been sent successfully!', null, 200);
  } catch (error) {
    console.error('Error sending contact us message:', error);

    return sendResponse(res, false, 'An error occurred while sending your message.', null, 500);
  }
};
