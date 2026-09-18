const venueAreaService = require("../services/venueArea.service");

const createVenueArea = async (req, res) => {
  try {
    const { venueId } = req.params;
    const { name, description } = req.body;
    const adminId = req.user.userId;

    const area = await venueAreaService.createVenueArea(
      venueId,
      adminId,
      name,
      description
    );

    res.status(201).json({
      message: "Venue area created successfully",
      area,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Venue not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "You are not allowed to modify this venue") {
      return res.status(403).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to create venue area",
    });
  }
};

const getVenueAreasByVenue = async (req, res) => {
  try {
    const { venueId } = req.params;

    const areas = await venueAreaService.getVenueAreasByVenueId(venueId);

    res.status(200).json({
      areas,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Venue not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to fetch venue areas",
    });
  }
};

const getVenueAreaById = async (req, res) => {
  try {
    const { id } = req.params;

    const area = await venueAreaService.getVenueAreaById(id);

    res.status(200).json({
      area,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Venue area not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to fetch venue area",
    });
  }
};

module.exports = {
  createVenueArea,
  getVenueAreasByVenue,
  getVenueAreaById,
};
