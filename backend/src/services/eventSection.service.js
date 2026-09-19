const eventModel = require("../models/event.model");
const eventSectionModel = require("../models/eventSection.model");
const pool=require('../config/database')
const addSectionToEvent = async (
  eventId,
  adminId,
  { venueSectionId, price }
) => {
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

  const eventWithOwner = await eventModel.getEventWithOwner(eventId);

  if (!eventWithOwner) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  if (eventWithOwner.venue_admin_id !== adminId) {
    const error = new Error(
      "You are not allowed to manage sections for this event"
    );
    error.statusCode = 403;
    throw error;
  }

  const sectionWithOwner =
    await eventSectionModel.getVenueSectionWithOwnerAndArea(
      venueSectionId
    );

  if (!sectionWithOwner) {
    const error = new Error("Venue section not found");
    error.statusCode = 404;
    throw error;
  }

  if (sectionWithOwner.venue_area_id !== eventWithOwner.venue_area_id) {
    const error = new Error(
      "Section does not belong to the event's venue area"
    );
    error.statusCode = 400;
    throw error;
  }

  const existingSection =
    await eventSectionModel.getEventSectionByEventAndVenueSection(
      eventId,
      venueSectionId
    );

  if (existingSection) {
    const error = new Error("Section already configured for this event");
    error.statusCode = 400;
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Create event section
    const created = await eventSectionModel.createEventSection(client, {
      eventId,
      venueSectionId,
      price: numericPrice,
    });

    // Create event-specific inventory
    await client.query(
      `
        INSERT INTO event_seats (event_id, seat_id)
        SELECT $1, id
        FROM seats
        WHERE section_id = $2
      `,
      [eventId, venueSectionId]
    );

    await client.query("COMMIT");

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
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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

const removeSectionFromEvent = async (
  eventId,
  eventSectionId,
  adminId
) => {
  const eventSectionWithOwner =
    await eventSectionModel.getEventSectionWithOwner(eventSectionId);

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
    const error = new Error(
      "You are not allowed to remove sections from this event"
    );
    error.statusCode = 403;
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Delete event-specific seats
    await client.query(
      `
        DELETE FROM event_seats
        WHERE event_id = $1
          AND seat_id IN (
            SELECT id
            FROM seats
            WHERE section_id = $2
          )
      `,
      [eventId, eventSectionWithOwner.venue_section_id]
    );

    // 2. Delete event section
    await eventSectionModel.deleteEventSection(
      client,
      eventSectionId
    );

    await client.query("COMMIT");

    return {
      message: "Section removed from event successfully",
      id: eventSectionId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
