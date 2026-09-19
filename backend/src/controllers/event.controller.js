const eventService = require("../services/event.service");

const createEvent = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { venueAreaId, name, description, startTime, endTime, sections } = req.body;

    const event = await eventService.createEvent(adminId, {
      venueAreaId,
      name,
      description,
      startTime,
      endTime,
      sections,
    });

    return res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Event creation error:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Failed to create event",
    });
  }
};

const getAdminEvents = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const events = await eventService.getAdminEvents(adminId);

    return res.status(200).json({
      events,
    });
  } catch (error) {
    console.error("Fetch admin events error:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Failed to fetch events",
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventByIdPublic(id);

    return res.status(200).json({
      event,
    });
  } catch (error) {
    console.error("Fetch event error:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Failed to fetch event",
    });
  }
};

const getAdminEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;
    const event = await eventService.getEventByIdForAdmin(id, adminId);

    return res.status(200).json({
      event,
    });
  } catch (error) {
    console.error("Fetch admin event error:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Failed to fetch event",
    });
  }
};

const getAllPublicEvents = async (req, res) => {
  try {
    const events = await eventService.getAllPublicEvents();

    return res.status(200).json({
      events,
    });
  } catch (error) {
    console.error("Fetch public events error:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Failed to fetch public events",
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;
    const { name, description, startTime, endTime, venueAreaId } = req.body;

    const event = await eventService.updateEvent(id, adminId, {
      name,
      description,
      startTime,
      endTime,
      venueAreaId,
    });

    return res.status(200).json({
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Update event error:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Failed to update event",
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;

    const result = await eventService.deleteEvent(id, adminId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete event error:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Failed to delete event",
    });
  }
};

module.exports = {
  createEvent,
  getAdminEvents,
  getEventById,
  getAdminEventById,
  getAllPublicEvents,
  updateEvent,
  deleteEvent,
};
