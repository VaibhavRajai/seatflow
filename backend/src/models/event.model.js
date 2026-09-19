const pool = require("../config/database");

const createEvent = async (db, { venueAreaId, name, description, startTime, endTime }) => {
  const queryRunner = db || pool;
  const query = `
    INSERT INTO events (
      venue_area_id,
      name,
      description,
      start_time,
      end_time
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      venue_area_id,
      name,
      description,
      start_time,
      end_time,
      created_at,
      updated_at;
  `;

  const values = [venueAreaId, name, description || null, startTime, endTime];
  const result = await queryRunner.query(query, values);
  return result.rows[0];
};

const getEventById = async (eventId) => {
  const query = `
    SELECT
      id,
      venue_area_id,
      name,
      description,
      start_time,
      end_time,
      created_at,
      updated_at
    FROM events
    WHERE id = $1;
  `;

  const result = await pool.query(query, [eventId]);
  return result.rows[0] || null;
};

const getEventWithOwner = async (eventId) => {
  const query = `
    SELECT
      e.id,
      e.venue_area_id,
      e.name,
      e.description,
      e.start_time,
      e.end_time,
      e.created_at,
      e.updated_at,
      va.venue_id,
      va.name AS area_name,
      v.name AS venue_name,
      v.city AS venue_city,
      v.address AS venue_address,
      v.admin_id AS venue_admin_id
    FROM events e
    JOIN venue_areas va ON va.id = e.venue_area_id
    JOIN venues v ON v.id = va.venue_id
    WHERE e.id = $1;
  `;

  const result = await pool.query(query, [eventId]);
  return result.rows[0] || null;
};

const getEventDetailsWithSections = async (eventId) => {
  const query = `
    SELECT
      e.id AS event_id,
      e.name AS event_name,
      e.description AS event_description,
      e.start_time,
      e.end_time,
      e.created_at AS event_created_at,
      e.updated_at AS event_updated_at,

      va.id AS area_id,
      va.name AS area_name,
      va.description AS area_description,

      v.id AS venue_id,
      v.name AS venue_name,
      v.address AS venue_address,
      v.city AS venue_city,
      v.admin_id AS venue_admin_id,

      es.id AS event_section_id,
      es.price AS event_section_price,
      es.created_at AS event_section_created_at,

      vs.id AS venue_section_id,
      vs.name AS section_name,
      vs.capacity AS section_capacity,
      vs.rows_count AS section_rows_count,
      vs.seats_per_row AS section_seats_per_row

    FROM events e
    JOIN venue_areas va ON va.id = e.venue_area_id
    JOIN venues v ON v.id = va.venue_id
    LEFT JOIN event_sections es ON es.event_id = e.id
    LEFT JOIN venue_sections vs ON vs.id = es.venue_section_id
    WHERE e.id = $1
    ORDER BY es.created_at ASC, vs.name ASC;
  `;

  const result = await pool.query(query, [eventId]);
  const rows = result.rows;

  if (!rows || rows.length === 0) {
    return null;
  }

  const firstRow = rows[0];
  const sections = [];

  for (const row of rows) {
    if (row.event_section_id && row.venue_section_id) {
      sections.push({
        id: row.event_section_id,
        venueSectionId: row.venue_section_id,
        name: row.section_name,
        capacity: Number(row.section_capacity),
        rowsCount: Number(row.section_rows_count),
        seatsPerRow: Number(row.section_seats_per_row),
        price: parseFloat(row.event_section_price),
        createdAt: row.event_section_created_at,
      });
    }
  }

  return {
    id: firstRow.event_id,
    name: firstRow.event_name,
    description: firstRow.event_description,
    startTime: firstRow.start_time,
    endTime: firstRow.end_time,
    createdAt: firstRow.event_created_at,
    updatedAt: firstRow.event_updated_at,
    venue: {
      id: firstRow.venue_id,
      name: firstRow.venue_name,
      address: firstRow.venue_address,
      city: firstRow.venue_city,
      adminId: firstRow.venue_admin_id,
    },
    area: {
      id: firstRow.area_id,
      name: firstRow.area_name,
      description: firstRow.area_description,
    },
    sections,
  };
};

const getAdminEvents = async (adminId) => {
  const query = `
    SELECT
      e.id AS event_id,
      e.name AS event_name,
      e.description AS event_description,
      e.start_time,
      e.end_time,
      e.created_at AS event_created_at,
      e.updated_at AS event_updated_at,

      va.id AS area_id,
      va.name AS area_name,

      v.id AS venue_id,
      v.name AS venue_name,
      v.city AS venue_city,

      es.id AS event_section_id,
      es.price AS event_section_price,

      vs.id AS venue_section_id,
      vs.name AS section_name,
      vs.capacity AS section_capacity

    FROM events e
    JOIN venue_areas va ON va.id = e.venue_area_id
    JOIN venues v ON v.id = va.venue_id
    LEFT JOIN event_sections es ON es.event_id = e.id
    LEFT JOIN venue_sections vs ON vs.id = es.venue_section_id
    WHERE v.admin_id = $1
    ORDER BY e.start_time DESC, e.created_at DESC;
  `;

  const result = await pool.query(query, [adminId]);
  const rows = result.rows;

  const eventsMap = new Map();

  for (const row of rows) {
    if (!eventsMap.has(row.event_id)) {
      eventsMap.set(row.event_id, {
        id: row.event_id,
        name: row.event_name,
        description: row.event_description,
        startTime: row.start_time,
        endTime: row.end_time,
        createdAt: row.event_created_at,
        updatedAt: row.event_updated_at,
        venue: {
          id: row.venue_id,
          name: row.venue_name,
          city: row.venue_city,
        },
        area: {
          id: row.area_id,
          name: row.area_name,
        },
        sections: [],
      });
    }

    if (row.event_section_id && row.venue_section_id) {
      const event = eventsMap.get(row.event_id);
      event.sections.push({
        id: row.event_section_id,
        venueSectionId: row.venue_section_id,
        name: row.section_name,
        capacity: Number(row.section_capacity),
        price: parseFloat(row.event_section_price),
      });
    }
  }

  return Array.from(eventsMap.values());
};

const getAllPublicEvents = async () => {
  const query = `
    SELECT
      e.id AS event_id,
      e.name AS event_name,
      e.description AS event_description,
      e.start_time,
      e.end_time,
      e.created_at AS event_created_at,
      e.updated_at AS event_updated_at,

      va.id AS area_id,
      va.name AS area_name,

      v.id AS venue_id,
      v.name AS venue_name,
      v.city AS venue_city,
      v.address AS venue_address,

      es.id AS event_section_id,
      es.price AS event_section_price,

      vs.id AS venue_section_id,
      vs.name AS section_name,
      vs.capacity AS section_capacity

    FROM events e
    JOIN venue_areas va ON va.id = e.venue_area_id
    JOIN venues v ON v.id = va.venue_id
    LEFT JOIN event_sections es ON es.event_id = e.id
    LEFT JOIN venue_sections vs ON vs.id = es.venue_section_id
    ORDER BY e.start_time ASC, e.created_at DESC;
  `;

  const result = await pool.query(query);
  const rows = result.rows;

  const eventsMap = new Map();

  for (const row of rows) {
    if (!eventsMap.has(row.event_id)) {
      eventsMap.set(row.event_id, {
        id: row.event_id,
        name: row.event_name,
        description: row.event_description,
        startTime: row.start_time,
        endTime: row.end_time,
        createdAt: row.event_created_at,
        updatedAt: row.event_updated_at,
        venue: {
          id: row.venue_id,
          name: row.venue_name,
          city: row.venue_city,
          address: row.venue_address,
        },
        area: {
          id: row.area_id,
          name: row.area_name,
        },
        sections: [],
      });
    }

    if (row.event_section_id && row.venue_section_id) {
      const event = eventsMap.get(row.event_id);
      event.sections.push({
        id: row.event_section_id,
        venueSectionId: row.venue_section_id,
        name: row.section_name,
        capacity: Number(row.section_capacity),
        price: parseFloat(row.event_section_price),
      });
    }
  }

  return Array.from(eventsMap.values());
};

const updateEvent = async (eventId, { name, description, startTime, endTime, venueAreaId }) => {
  const query = `
    UPDATE events
    SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      start_time = COALESCE($3, start_time),
      end_time = COALESCE($4, end_time),
      venue_area_id = COALESCE($5, venue_area_id),
      updated_at = NOW()
    WHERE id = $6
    RETURNING
      id,
      venue_area_id,
      name,
      description,
      start_time,
      end_time,
      created_at,
      updated_at;
  `;

  const values = [name, description, startTime, endTime, venueAreaId, eventId];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

const deleteEvent = async (eventId) => {
  const query = `
    DELETE FROM events
    WHERE id = $1
    RETURNING id;
  `;

  const result = await pool.query(query, [eventId]);
  return result.rows[0] || null;
};

module.exports = {
  createEvent,
  getEventById,
  getEventWithOwner,
  getEventDetailsWithSections,
  getAdminEvents,
  getAllPublicEvents,
  updateEvent,
  deleteEvent,
};
