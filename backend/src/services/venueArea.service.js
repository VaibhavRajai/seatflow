const venueAreaModel = require("../models/venueArea.model");
const venueModel = require("../models/venue.model");

const createVenueArea = async (venueId, adminId, name, description) => {
  const venue = await venueModel.getVenueById(venueId);

  if (!venue) {
    throw new Error("Venue not found");
  }

  if (venue.admin_id !== adminId) {
    throw new Error("You are not allowed to modify this venue");
  }

  const area = await venueAreaModel.createVenueArea(
    venueId,
    name,
    description
  );

  return area;
};

const getVenueAreasByVenueId = async (venueId) => {
  const venue = await venueModel.getVenueById(venueId);

  if (!venue) {
    throw new Error("Venue not found");
  }

  const areas = await venueAreaModel.getVenueAreasByVenueId(venueId);
  return areas;
};

const getVenueAreaById = async (areaId) => {
  const area = await venueAreaModel.getVenueAreaById(areaId);

  if (!area) {
    throw new Error("Venue area not found");
  }

  return area;
};

module.exports = {
  createVenueArea,
  getVenueAreasByVenueId,
  getVenueAreaById,
};
