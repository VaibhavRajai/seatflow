const venueModel = require("../models/venue.model");
const AppError=require('../utils/appError')
const createVenue = async (
  name,
  description,
  address,
  city,
  adminId
) => {
  

  const venue = await venueModel.createVenue(
    name,
    description,
    address,
    city,
    adminId
  );



  return venue;
};

const getAllVenues = async () => {
  const venues = await venueModel.getAllVenues();

  return venues;
};

const getVenueById = async (venueId) => {
  const venue = await venueModel.getVenueById(venueId);

  if (!venue) {
    throw new AppError("Venue not found",404);
  }

  return venue;
};

const updateVenue = async (
  venueId,
  adminId,
  name,
  description,
  address,
  city
) => {
  // 1. Find the venue
  const venue = await venueModel.getVenueById(venueId);

  if (!venue) {
    throw new Error("Venue not found");
  }

  // 2. Check ownership
  if (venue.admin_id !== adminId) {
    throw new Error("You are not allowed to modify this venue");
  }

  // 3. Update venue
  const updatedVenue = await venueModel.updateVenue(
    venueId,
    name,
    description,
    address,
    city
  );

  return updatedVenue;
};
module.exports = {
  createVenue,
  getAllVenues,
  getVenueById,
  updateVenue
};