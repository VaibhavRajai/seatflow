const venueSectionModel = require("../models/venueSection.model");
const venueAreaModel = require("../models/venueArea.model");
const venueModel = require("../models/venue.model");

const createVenueSection = async (
  venueAreaId,
  adminId,
  name,
  capacity,
  rowsCount,
  seatsPerRow
) => {
  const areaWithOwner = await venueAreaModel.getVenueAreaWithOwner(venueAreaId);

  if (!areaWithOwner) {
    throw new Error("Venue area not found");
  }

  if (areaWithOwner.venue_admin_id !== adminId) {
    throw new Error("You are not allowed to modify this venue");
  }

  const section = await venueSectionModel.createVenueSection(
    venueAreaId,
    name,
    capacity,
    rowsCount,
    seatsPerRow
  );

  return section;
};

const getVenueLayout = async (venueId) => {
  const venue = await venueModel.getVenueById(venueId);

  if (!venue) {
    throw new Error("Venue not found");
  }

  const rows = await venueSectionModel.getVenueLayout(venueId);

  const areasMap = new Map();

  for (const row of rows) {
    if (!row.area_id) continue;

    if (!areasMap.has(row.area_id)) {
      areasMap.set(row.area_id, {
        id: row.area_id,
        name: row.area_name,
        description: row.area_description,
        sections: new Map(),
      });
    }

    const area = areasMap.get(row.area_id);

    if (row.section_id) {
      if (!area.sections.has(row.section_id)) {
        area.sections.set(row.section_id, {
          id: row.section_id,
          name: row.section_name,
          capacity: row.capacity,
          rowsCount: row.rows_count,
          seatsPerRow: row.seats_per_row,
          seats: [],
        });
      }

      const section = area.sections.get(row.section_id);

      if (row.seat_id) {
        section.seats.push({
          id: row.seat_id,
          rowLabel: row.row_label,
          seatNumber: row.seat_number,
        });
      }
    }
  }

  const formattedAreas = Array.from(areasMap.values()).map((area) => ({
    id: area.id,
    name: area.name,
    description: area.description,
    sections: Array.from(area.sections.values()),
  }));

  return {
    venue: {
      id: venue.id,
      name: venue.name,
    },
    areas: formattedAreas,
  };
};

module.exports = {
  createVenueSection,
  getVenueLayout,
};