const sgMail = require('@sendgrid/mail');
const { apiKey, RESET_PASSWORD_TEMPLATE_ID, INVITE_BARBER_TEMPLATE_ID, INVITE_SALON_TEMPLATE_ID,FROM_EMAIL } = require('../config/sendGridConfig');

// sgMail.setApiKey(apiKey);

async function sendEmail(email, subject, template_id, data) {
    sgMail.setApiKey(apiKey);
     // Define the email message with SendGrid template data
     const message = {
        to: email,
        subject :subject,
        from: FROM_EMAIL,  // Replace with your support email
        templateId: template_id,  // Replace with your SendGrid template ID
        dynamic_template_data: data
    };      
    try {
        await sgMail.send(message);
        console.log('Email sent successfully!');
      } catch (error) {
        console.error('Error sending email:', error.response ? error.response.body : error);
      }
}

module.exports = { sendEmail };
