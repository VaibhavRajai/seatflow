const pool = require("../config/database");

const createEventSection = async (db, { eventId, venueSectionId, price }) => {
  const queryRunner = db || pool;
  const query = `
    INSERT INTO event_sections (
      event_id,
      venue_section_id,
      price
    )
    VALUES ($1, $2, $3)
    RETURNING
      id,
      event_id,
      venue_section_id,
      price,
      created_at,
      updated_at;
  `;

  const values = [eventId, venueSectionId, price];
  const result = await queryRunner.query(query, values);
  return result.rows[0];
};

const getEventSectionById = async (eventSectionId) => {
  const query = `
    SELECT
      id,
      event_id,
      venue_section_id,
      price,
      created_at,
      updated_at
    FROM event_sections
    WHERE id = $1;
  `;

  const result = await pool.query(query, [eventSectionId]);
  return result.rows[0] || null;
};

const getEventSectionByEventAndVenueSection = async (eventId, venueSectionId) => {
  const query = `
    SELECT
      id,
      event_id,
      venue_section_id,
      price,
      created_at,
      updated_at
    FROM event_sections
    WHERE event_id = $1 AND venue_section_id = $2;
  `;

  const result = await pool.query(query, [eventId, venueSectionId]);
  return result.rows[0] || null;
};

const getEventSectionsByEventId = async (eventId) => {
  const query = `
    SELECT
      es.id,
      es.event_id,
      es.venue_section_id,
      es.price,
      es.created_at,
      es.updated_at,
      vs.name AS section_name,
      vs.capacity,
      vs.rows_count,
      vs.seats_per_row
    FROM event_sections es
    JOIN venue_sections vs ON vs.id = es.venue_section_id
    WHERE es.event_id = $1
    ORDER BY es.created_at ASC, vs.name ASC;
  `;

  const result = await pool.query(query, [eventId]);
  return result.rows.map((row) => ({
    id: row.id,
    eventId: row.event_id,
    venueSectionId: row.venue_section_id,
    name: row.section_name,
    capacity: Number(row.capacity),
    rowsCount: Number(row.rows_count),
    seatsPerRow: Number(row.seats_per_row),
    price: parseFloat(row.price),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

const updateEventSectionPrice = async (eventSectionId, price) => {
  const query = `
    UPDATE event_sections
    SET
      price = $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING
      id,
      event_id,
      venue_section_id,
      price,
      created_at,
      updated_at;
  `;

  const result = await pool.query(query, [price, eventSectionId]);
  return result.rows[0] || null;
};

const deleteEventSection = async (client,eventSectionId) => {
  const query = `
    DELETE FROM event_sections
    WHERE id = $1
    RETURNING id;
  `;
  const db=client || pool;


  const result = await db.query(query, [eventSectionId]);
  return result.rows[0] || null;
};

const getVenueSectionWithOwnerAndArea = async (venueSectionId) => {
  const query = `
    SELECT
      vs.id,
      vs.venue_area_id,
      vs.name,
      vs.capacity,
      va.venue_id,
      v.admin_id AS venue_admin_id
    FROM venue_sections vs
    JOIN venue_areas va ON va.id = vs.venue_area_id
    JOIN venues v ON v.id = va.venue_id
    WHERE vs.id = $1;
  `;

  const result = await pool.query(query, [venueSectionId]);
  return result.rows[0] || null;
};

const getEventSectionWithOwner = async (eventSectionId) => {
  const query = `
    SELECT
      es.id,
      es.event_id,
      es.venue_section_id,
      es.price,
      es.created_at,
      es.updated_at,
      e.venue_area_id,
      va.venue_id,
      v.admin_id AS venue_admin_id
    FROM event_sections es
    JOIN events e ON e.id = es.event_id
    JOIN venue_areas va ON va.id = e.venue_area_id
    JOIN venues v ON v.id = va.venue_id
    WHERE es.id = $1;
  `;

  const result = await pool.query(query, [eventSectionId]);
  return result.rows[0] || null;
};

module.exports = {
  createEventSection,
  getEventSectionById,
  getEventSectionByEventAndVenueSection,
  getEventSectionsByEventId,
  updateEventSectionPrice,
  deleteEventSection,
  getVenueSectionWithOwnerAndArea,
  getEventSectionWithOwner,
};
