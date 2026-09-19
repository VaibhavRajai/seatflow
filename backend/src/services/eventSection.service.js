const eventModel = require("../models/event.model");
const eventSectionModel = require("../models/eventSection.model");

const addSectionToEvent = async (eventId, adminId, { venueSectionId, price }) => {
  if (!venueSectionId) {
    const error = new Error("Venue section ID is required");
    error.statusCode = 400;
    throw error;
  }

  const numericPrice = Number(price);
  if (price === undefined || isNaN(numericPrice) || numericPrice < 0) {
    const error = new Error("Price must be greater than or equal to zero");
    error.statusCode = 400;
    throw error;
  }

  // 1. Verify Event exists
  const eventWithOwner = await eventModel.getEventWithOwner(eventId);
  if (!eventWithOwner) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  // 2. Verify Event belongs to authenticated admin
  if (eventWithOwner.venue_admin_id !== adminId) {
    const error = new Error("You are not allowed to manage sections for this event");
    error.statusCode = 403;
    throw error;
  }

  // 3. Verify Venue section exists
  const sectionWithOwner = await eventSectionModel.getVenueSectionWithOwnerAndArea(venueSectionId);
  if (!sectionWithOwner) {
    const error = new Error("Venue section not found");
    error.statusCode = 404;
    throw error;
  }

  // 4. Verify Venue section belongs to the SAME venue area as the event
  if (sectionWithOwner.venue_area_id !== eventWithOwner.venue_area_id) {
    const error = new Error("Section does not belong to the event's venue area");
    error.statusCode = 400;
    throw error;
  }

  // 5. Verify section is not already configured for this event
  const existingSection = await eventSectionModel.getEventSectionByEventAndVenueSection(
    eventId,
    venueSectionId
  );
  if (existingSection) {
    const error = new Error("Section already configured for this event");
    error.statusCode = 400;
    throw error;
  }

  const created = await eventSectionModel.createEventSection(null, {
    eventId,
    venueSectionId,
    price: numericPrice,
  });

  return {
    id: created.id,
    eventId: created.event_id,
    venueSectionId: created.venue_section_id,
    name: sectionWithOwner.name,
    capacity: sectionWithOwner.capacity,
    price: parseFloat(created.price),
    createdAt: created.created_at,
    updatedAt: created.updated_at,
  };
};

const updateSectionPrice = async (eventId, eventSectionId, adminId, price) => {
  const numericPrice = Number(price);
  if (price === undefined || isNaN(numericPrice) || numericPrice < 0) {
    const error = new Error("Price must be greater than or equal to zero");
    error.statusCode = 400;
    throw error;
  }

  const eventSectionWithOwner = await eventSectionModel.getEventSectionWithOwner(eventSectionId);
  if (!eventSectionWithOwner) {
    const error = new Error("Event section not found");
    error.statusCode = 404;
    throw error;
  }

  if (eventSectionWithOwner.event_id !== eventId) {
    const error = new Error("Event section does not belong to this event");
    error.statusCode = 400;
    throw error;
  }

  if (eventSectionWithOwner.venue_admin_id !== adminId) {
    const error = new Error("You are not allowed to modify this event section");
    error.statusCode = 403;
    throw error;
  }

  const updated = await eventSectionModel.updateEventSectionPrice(eventSectionId, numericPrice);

  return {
    id: updated.id,
    eventId: updated.event_id,
    venueSectionId: updated.venue_section_id,
    price: parseFloat(updated.price),
    updatedAt: updated.updated_at,
  };
};

const removeSectionFromEvent = async (eventId, eventSectionId, adminId) => {
  const eventSectionWithOwner = await eventSectionModel.getEventSectionWithOwner(eventSectionId);
  if (!eventSectionWithOwner) {
    const error = new Error("Event section not found");
    error.statusCode = 404;
    throw error;
  }

  if (eventSectionWithOwner.event_id !== eventId) {
    const error = new Error("Event section does not belong to this event");
    error.statusCode = 400;
    throw error;
  }

  if (eventSectionWithOwner.venue_admin_id !== adminId) {
    const error = new Error("You are not allowed to remove sections from this event");
    error.statusCode = 403;
    throw error;
  }

  await eventSectionModel.deleteEventSection(eventSectionId);

  return {
    message: "Section removed from event successfully",
    id: eventSectionId,
  };
};

const getEventSections = async (eventId) => {
  const event = await eventModel.getEventById(eventId);
  if (!event) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  return await eventSectionModel.getEventSectionsByEventId(eventId);
};

module.exports = {
  addSectionToEvent,
  updateSectionPrice,
  removeSectionFromEvent,
  getEventSections,
};
