const venueService = require("../services/venue.service");

const createVenue = async (req, res) => {
  try {
  

    const { name, description, address, city } = req.body;
    const adminId = req.user.userId;



    const venue = await venueService.createVenue(
      name,
      description,
      address,
      city,
      adminId
    );

  

    res.status(201).json({
      message: "Venue created successfully",
      venue,
    });
  } catch (error) {
    console.error("Controller error:", error);

    res.status(500).json({
      message: "Failed to create venue",
    });
  }
};

const getAllVenues = async (req, res) => {
  try {
    const venues = await venueService.getAllVenues();

    res.status(200).json({
      venues,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch venues",
    });
  }
};

const getVenueById = async (req, res) => {
  try {
    const { id } = req.params;

    const venue = await venueService.getVenueById(id);

    res.status(200).json({
      venue,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Venue not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to fetch venue",
    });
  }
};

const updateVenue = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      address,
      city,
    } = req.body;

    const adminId = req.user.userId;

    const updatedVenue = await venueService.updateVenue(
      id,
      adminId,
      name,
      description,
      address,
      city
    );

    res.status(200).json({
      message: "Venue updated successfully",
      venue: updatedVenue,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Venue not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error.message ===
      "You are not allowed to modify this venue"
    ) {
      return res.status(403).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to update venue",
    });
  }
};
module.exports = {
  createVenue,
  getAllVenues,
  getVenueById,
  updateVenue
};