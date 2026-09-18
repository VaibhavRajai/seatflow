const pool = require("../config/database");

const createVenueArea = async (venueId, name, description) => {
  const query = `
    INSERT INTO venue_areas (
      venue_id,
      name,
      description
    )
    VALUES ($1, $2, $3)
    RETURNING
      id,
      venue_id,
      name,
      description,
      created_at,
      updated_at;
  `;

  const values = [venueId, name, description];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getVenueAreasByVenueId = async (venueId) => {
  const query = `
    SELECT
      id,
      venue_id,
      name,
      description,
      created_at,
      updated_at
    FROM venue_areas
    WHERE venue_id = $1
    ORDER BY created_at ASC;
  `;

  const result = await pool.query(query, [venueId]);
  return result.rows;
};

const getVenueAreaById = async (areaId) => {
  const query = `
    SELECT
      id,
      venue_id,
      name,
      description,
      created_at,
      updated_at
    FROM venue_areas
    WHERE id = $1;
  `;

  const result = await pool.query(query, [areaId]);
  return result.rows[0] || null;
};

const getVenueAreaWithOwner = async (areaId) => {
  const query = `
    SELECT
      va.id,
      va.venue_id,
      va.name,
      va.description,
      va.created_at,
      va.updated_at,
      v.admin_id AS venue_admin_id
    FROM venue_areas va
    JOIN venues v ON v.id = va.venue_id
    WHERE va.id = $1;
  `;

  const result = await pool.query(query, [areaId]);
  return result.rows[0] || null;
};

const updateVenueArea = async (areaId, name, description) => {
  const query = `
    UPDATE venue_areas
    SET
      name = $1,
      description = $2,
      updated_at = NOW()
    WHERE id = $3
    RETURNING
      id,
      venue_id,
      name,
      description,
      created_at,
      updated_at;
  `;

  const values = [name, description, areaId];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

module.exports = {
  createVenueArea,
  getVenueAreasByVenueId,
  getVenueAreaById,
  getVenueAreaWithOwner,
  updateVenueArea,
};
