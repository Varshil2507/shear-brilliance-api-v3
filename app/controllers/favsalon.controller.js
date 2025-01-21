const db = require("../models");
const FavoriteSalon = db.FavoriteSalon; // Ensure the model name is correct
const Salon = db.Salon; // Ensure you're using the correct model name for salons
const User = db.USER; // Ensure that this references your User model
const sendResponse = require('../helpers/responseHelper');  // Import the helper

// Add or update a favorite salon (like or dislike)
exports.addOrUpdateFavoriteSalon = async (req, res) => {
  try {
    let { UserId, SalonId, status, device_id } = req.body;

      UserId = req.user ? req.user.id : UserId; 
    // Check if the salon is already in the user's favorites
    const existingFavorite = await FavoriteSalon.findOne({
      where: { UserId, SalonId }
    });

    if (existingFavorite) {
      // Update the status (like/dislike) if the salon is already in favorites
      existingFavorite.status = status;
      existingFavorite.device_id = device_id;

      // If the status is "dislike", remove the favorite salon
      if (status === "dislike") {
          // Save the updated favorite
        await existingFavorite.save();
        return sendResponse(res, true, `Salon status updated to ${status}`, existingFavorite, 200);
      }

      // Otherwise, just save the updated favorite
      await existingFavorite.save();
      return sendResponse(res,true, `Salon status updated to ${status}`, existingFavorite, 200);
    }

    // Create a new favorite entry
    const favorite = await FavoriteSalon.create({ UserId, SalonId, status, device_id });
    sendResponse(res, true, `Salon added to favorites with status: ${status}`, favorite, 201);
  } catch (error) {
    sendResponse(res, false, "Error adding/updating favorite salon", error.message, 500);
  }
};


//get favsalon
exports.getAllFavorites = async (req, res) => {
  try {
    // Fetch all favorite salons with the entire salon details
    const favorites = await FavoriteSalon.findAll({
      attributes: ['id', 'UserId', 'SalonId', 'status'], // Only include fields from FavoriteSalon
      include: [
        {
          model: Salon, // Specify the associated Salon model
          as: 'Salon'
          // No 'attributes' field to include all fields from Salon model
        },
      ],
    });

    if (!favorites || favorites.length === 0) {
      return sendResponse(res, false, "No favorite salons found.", null, 404);
    }

    // Map the response to include the favorite salon details along with the full salon object
    const response = favorites.map(favorite => ({
      favoriteId: favorite.id,
      UserId: favorite.UserId,
      SalonId: favorite.SalonId,
      status: favorite.status, // Like/Dislike status
      salon: favorite.Salon ? favorite.Salon : null, // Include the whole Salon object with all its fields
    }));

    sendResponse(res, true, "Fetched all favorite salons successfully", response, 200);
  } catch (error) {
    console.error("Error fetching all favorite salons:", error.message); // Log the error message
    console.error(error.stack); // Log the error stack for debugging
    sendResponse(res, false, "Error fetching all favorite salons", error.message, 500);
  }
};
