const twilio = require("twilio");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  throw new Error("Twilio environment variables are missing.");
}

const client = twilio(accountSid, authToken);

// Function to validate phone numbers
const validatePhoneNumber = (phoneNumber) => {
  const parsedNumber = parsePhoneNumberFromString(phoneNumber);
  if (parsedNumber && parsedNumber.isValid()) {
    return parsedNumber.format('E.164');  // Format in E.164 international format
  }
  throw new Error('Invalid phone number.');
};

const sendSMS = async (to, message) => {
  try {
    // Validate phone number and ensure it's in the E.164 format
    const validatedPhoneNumber = validatePhoneNumber(to);
    console.log("Sending SMS to:", validatedPhoneNumber);

    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: validatedPhoneNumber,
    });

    console.log("SMS sent successfully. SID:", response.sid);
    return response.sid;
  } catch (error) {
    console.error("Twilio SMS sending error:", error.message);
    throw error;
  }
};

module.exports = { sendSMS };
