const db = require("../models");
const FcmToken = db.fcmTokens;
const { sendNotification } = require("../services/notificationService");


const sendNotificationController = async (req, res) => {
  const { title, body, image } = req.body;

  // Validate input data
  if (!title || !body) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: title or body",
    });
  }

  try {
    // Call the sendNotification service
    const { success, response, error } = await sendNotification(title, body, image);

    if (success) {
      return res.status(200).json({
        success: true,
        message: "Notification sent successfully",
        data: response,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send notification",
        error,
      });
    }
  } catch (error) {
    console.error("Error in sendNotificationController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const saveFcmToken = async (req, res) => {
  const { token, deviceType } = req.body;

  const userId = req.user.id;

  if (!userId || !token) {
    return res.status(400).json({ error: "Missing userId or token" });
  }

  try {
   // Check if the token already exists for the user
   const existingToken = await FcmToken.findOne({ where: { UserId: userId } });

   if (existingToken) {
     // Update the existing token with the new one
     await existingToken.update({
       token,
       device_type: deviceType || "unknown"
     });

     return res.status(200).json({
       success: true,
       message: "FCM token updated successfully",
       data: existingToken,
     });
   }

   // If no existing token, create a new one
    const newToken = await FcmToken.create({
      token,
      device_type: deviceType || "unknown",
      UserId: userId
    });

    return res.status(200).json({
        success: true,
        message: "FCM token saved successfully",
        data: newToken,
    });
  
  } catch (error) {
    console.error("Error in sendNotificationController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = { sendNotificationController, saveFcmToken };
