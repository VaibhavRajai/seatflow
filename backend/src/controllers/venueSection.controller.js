const venueSectionService = require("../services/venueSection.service");

const createVenueSection = async (req, res) => {
  try {
    const venueAreaId = req.params.venueAreaId || req.params.areaId;

    const {
      name,
      rowsCount,
      seatsPerRow,
    } = req.body;

    const adminId = req.user.userId;

    const section = await venueSectionService.createVenueSection(
      venueAreaId,
      adminId,
      name,
      rowsCount,
      seatsPerRow
    );

    res.status(201).json({
      message: "Venue section created successfully",
      section,
    });
  } catch (error) {
    console.error(error);

    if (
      error.message === "Venue area not found" ||
      error.message === "Venue not found"
    ) {
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
      message: "Failed to create venue section",
    });
  }
};

const getVenueLayout = async (req, res) => {
  try {
    const venueId = req.params.venueId || req.params.id;

    const layout = await venueSectionService.getVenueLayout(venueId);

    res.status(200).json(layout);
  } catch (error) {
    console.error(error);

    if (error.message === "Venue not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to fetch venue layout",
    });
  }
};

const getSectionsByArea = async (req, res) => {
  try {
    const venueAreaId = req.params.venueAreaId || req.params.areaId;
    const sections = await venueSectionService.getVenueSectionsByAreaId(venueAreaId);

    res.status(200).json({
      sections,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Venue area not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to fetch venue sections",
    });
  }
};

module.exports = {
  createVenueSection,
  getVenueLayout,
  getSectionsByArea,
};