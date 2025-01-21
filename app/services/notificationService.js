const admin = require("../config/firebase.config");

const sendNotification = async (title, body, image = null) => {
  if (!title || !body) {
    throw new Error("Missing required fields: title or body");
  }

  const message = {
    notification: { 
      title, 
      body, 
      ...(image && { image }) // Include image only if provided
    },
    topic: "allUsers", // Default topic for all users
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
    return { success: true, response };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: error.message };
  }
};

const sendNotificationToUser = async (token, title, body, image = null) => {
  if (!token || !title || !body) {
    throw new Error("Missing required fields: token, title, or body");
  }

  const message = {
    notification: {
      title,
      body,
      ...(image && { image }) // Include image only if provided
    },
    token, // Send to the specific FCM token
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
    return { success: true, response };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendNotification,sendNotificationToUser };
