const pool = require("../config/database");
const eventModel = require("../models/event.model");
const eventSectionModel = require("../models/eventSection.model");
const venueAreaModel = require("../models/venueArea.model");

const createEvent = async (adminId, eventData) => {
  const { venueAreaId, name, description, startTime, endTime, sections } = eventData;

  // Validation: Required fields
  if (!venueAreaId) {
    const error = new Error("Venue area is required");
    error.statusCode = 400;
    throw error;
  }

  if (!name || !name.trim()) {
    const error = new Error("Event name is required");
    error.statusCode = 400;
    throw error;
  }

  if (!startTime || !endTime) {
    const error = new Error("Start time and end time are required");
    error.statusCode = 400;
    throw error;
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    const error = new Error("Invalid start time or end time format");
    error.statusCode = 400;
    throw error;
  }

  if (end <= start) {
    const error = new Error("End time must be after start time");
    error.statusCode = 400;
    throw error;
  }

  // Verify venue area existence and ownership
  const areaWithOwner = await venueAreaModel.getVenueAreaWithOwner(venueAreaId);

  if (!areaWithOwner) {
    const error = new Error("Venue area not found");
    error.statusCode = 404;
    throw error;
  }

  if (areaWithOwner.venue_admin_id !== adminId) {
    const error = new Error("You are not allowed to create events for this venue");
    error.statusCode = 403;
    throw error;
  }

  // If sections are provided, validate them before opening transaction
  if (sections && Array.isArray(sections) && sections.length > 0) {
    const sectionIdsSeen = new Set();

    for (const section of sections) {
      if (!section.venueSectionId) {
        const error = new Error("Venue section ID is required for each configured section");
        error.statusCode = 400;
        throw error;
      }

      const price = Number(section.price);
      if (isNaN(price) || price < 0) {
        const error = new Error("Price must be greater than or equal to zero");
        error.statusCode = 400;
        throw error;
      }

      if (sectionIdsSeen.has(section.venueSectionId)) {
        const error = new Error("Duplicate section configured in the same event");
        error.statusCode = 400;
        throw error;
      }
      sectionIdsSeen.add(section.venueSectionId);

      // Verify section belongs to the SAME venue area as the event
      const sectionDetails = await eventSectionModel.getVenueSectionWithOwnerAndArea(
        section.venueSectionId
      );

      if (!sectionDetails) {
        const error = new Error(`Section with ID ${section.venueSectionId} not found`);
        error.statusCode = 404;
        throw error;
      }

      if (sectionDetails.venue_area_id !== venueAreaId) {
        const error = new Error("Section does not belong to the selected venue area");
        error.statusCode = 400;
        throw error;
      }
    }

    // Execute atomic creation in PostgreSQL transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const createdEvent = await eventModel.createEvent(client, {
        venueAreaId,
        name: name.trim(),
        description: description ? description.trim() : null,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });

      for (const section of sections) {
        await eventSectionModel.createEventSection(client, {
          eventId: createdEvent.id,
          venueSectionId: section.venueSectionId,
          price: Number(section.price),
        });
      }

      await client.query("COMMIT");

      return await eventModel.getEventDetailsWithSections(createdEvent.id);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // Without initial sections
  const createdEvent = await eventModel.createEvent(null, {
    venueAreaId,
    name: name.trim(),
    description: description ? description.trim() : null,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  });

  return await eventModel.getEventDetailsWithSections(createdEvent.id);
};

const getAdminEvents = async (adminId) => {
  return await eventModel.getAdminEvents(adminId);
};

const getEventByIdForAdmin = async (eventId, adminId) => {
  const event = await eventModel.getEventDetailsWithSections(eventId);

  if (!event) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  if (event.venue.adminId !== adminId) {
    const error = new Error("You are not allowed to view this event");
    error.statusCode = 403;
    throw error;
  }

  return event;
};

const getEventByIdPublic = async (eventId) => {
  const event = await eventModel.getEventDetailsWithSections(eventId);

  if (!event) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: event.id,
    name: event.name,
    description: event.description,
    startTime: event.startTime,
    endTime: event.endTime,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    venue: {
      id: event.venue.id,
      name: event.venue.name,
      city: event.venue.city,
      address: event.venue.address,
    },
    area: {
      id: event.area.id,
      name: event.area.name,
      description: event.area.description,
    },
    sections: event.sections.map((s) => ({
      id: s.id,
      venueSectionId: s.venueSectionId,
      name: s.name,
      capacity: s.capacity,
      price: s.price,
    })),
  };
};

const getAllPublicEvents = async () => {
  return await eventModel.getAllPublicEvents();
};

const updateEvent = async (eventId, adminId, updateData) => {
  const { name, description, startTime, endTime, venueAreaId } = updateData;

  const existingEvent = await eventModel.getEventWithOwner(eventId);

  if (!existingEvent) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  if (existingEvent.venue_admin_id !== adminId) {
    const error = new Error("You are not allowed to modify this event");
    error.statusCode = 403;
    throw error;
  }

  const effectiveStartTime = startTime ? new Date(startTime) : new Date(existingEvent.start_time);
  const effectiveEndTime = endTime ? new Date(endTime) : new Date(existingEvent.end_time);

  if (isNaN(effectiveStartTime.getTime()) || isNaN(effectiveEndTime.getTime())) {
    const error = new Error("Invalid start time or end time format");
    error.statusCode = 400;
    throw error;
  }

  if (effectiveEndTime <= effectiveStartTime) {
    const error = new Error("End time must be after start time");
    error.statusCode = 400;
    throw error;
  }

  let effectiveVenueAreaId = existingEvent.venue_area_id;

  if (venueAreaId && venueAreaId !== existingEvent.venue_area_id) {
    const newAreaWithOwner = await venueAreaModel.getVenueAreaWithOwner(venueAreaId);

    if (!newAreaWithOwner) {
      const error = new Error("Venue area not found");
      error.statusCode = 404;
      throw error;
    }

    if (newAreaWithOwner.venue_admin_id !== adminId) {
      const error = new Error("You are not allowed to move event to this venue");
      error.statusCode = 403;
      throw error;
    }

    // Changing venueArea removes previous area's sections to prevent inconsistent section relationships
    const existingSections = await eventSectionModel.getEventSectionsByEventId(eventId);
    for (const section of existingSections) {
      await eventSectionModel.deleteEventSection(section.id);
    }

    effectiveVenueAreaId = venueAreaId;
  }

  await eventModel.updateEvent(eventId, {
    name: name !== undefined ? name.trim() : null,
    description: description !== undefined ? (description ? description.trim() : null) : null,
    startTime: startTime ? effectiveStartTime.toISOString() : null,
    endTime: endTime ? effectiveEndTime.toISOString() : null,
    venueAreaId: effectiveVenueAreaId,
  });

  return await eventModel.getEventDetailsWithSections(eventId);
};

const deleteEvent = async (eventId, adminId) => {
  const existingEvent = await eventModel.getEventWithOwner(eventId);

  if (!existingEvent) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  if (existingEvent.venue_admin_id !== adminId) {
    const error = new Error("You are not allowed to delete this event");
    error.statusCode = 403;
    throw error;
  }

  await eventModel.deleteEvent(eventId);
  return { message: "Event deleted successfully", id: eventId };
};

module.exports = {
  createEvent,
  getAdminEvents,
  getEventByIdForAdmin,
  getEventByIdPublic,
  getAllPublicEvents,
  updateEvent,
  deleteEvent,
};
