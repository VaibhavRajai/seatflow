const eventSectionService = require("../services/eventSection.service");

const addSectionToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const adminId = req.user.userId;
    const { venueSectionId, price } = req.body;

    const section = await eventSectionService.addSectionToEvent(eventId, adminId, {
      venueSectionId,
      price,
    });

    return res.status(201).json({
      message: "Section added to event successfully",
      section,
    });
  } catch (error) {
    console.error("Add section to event error:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Failed to add section to event",
    });
  }
};

const updateSectionPrice = async (req, res) => {
  try {
    const { eventId, sectionId } = req.params;
    const adminId = req.user.userId;
    const { price } = req.body;

    const section = await eventSectionService.updateSectionPrice(
      eventId,
      sectionId,
      adminId,
      price
    );

    return res.status(200).json({
      message: "Section price updated successfully",
      section,
    });
  } catch (error) {
    console.error("Update section price error:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Failed to update section price",
    });
  }
};

const removeSectionFromEvent = async (req, res) => {
  try {
    const { eventId, sectionId } = req.params;
    const adminId = req.user.userId;

    const result = await eventSectionService.removeSectionFromEvent(
      eventId,
      sectionId,
      adminId
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Remove section from event error:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Failed to remove section from event",
    });
  }
};

const getEventSections = async (req, res) => {
  try {
    const { eventId } = req.params;
    const sections = await eventSectionService.getEventSections(eventId);

    return res.status(200).json({
      sections,
    });
  } catch (error) {
    console.error("Fetch event sections error:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Failed to fetch event sections",
    });
  }
};

module.exports = {
  addSectionToEvent,
  updateSectionPrice,
  removeSectionFromEvent,
  getEventSections,
};
