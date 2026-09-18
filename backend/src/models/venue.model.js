const pool = require("../config/database");

const createVenue = async (
  name,
  description,
  address,
  city,
  adminId
) => {
 

  const query = `
    INSERT INTO venues (
      name,
      description,
      address,
      city,
      admin_id
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      name,
      description,
      address,
      city,
      admin_id,
      created_at,
      updated_at;
  `;

  const values = [
    name,
    description,
    address,
    city,
    adminId,
  ];



  const result = await pool.query(query, values);



  return result.rows[0];
};

const getAllVenues = async () => {
  const query = `
    SELECT
      id,
      name,
      description,
      address,
      city,
      admin_id,
      created_at,
      updated_at
    FROM venues
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query);

  return result.rows;
};

const getVenueById = async (venueId) => {
  const query = `
    SELECT
      id,
      name,
      description,
      address,
      city,
      admin_id,
      created_at,
      updated_at
    FROM venues
    WHERE id = $1;
  `;

  const result = await pool.query(query, [venueId]);

  return result.rows[0] || null;
};
const updateVenue = async (
  venueId,
  name,
  description,
  address,
  city
) => {
  const query = `
    UPDATE venues
    SET
      name = $1,
      description = $2,
      address = $3,
      city = $4,
      updated_at = NOW()
    WHERE id = $5
    RETURNING
      id,
      name,
      description,
      address,
      city,
      admin_id,
      created_at,
      updated_at;
  `;

  const values = [
    name,
    description,
    address,
    city,
    venueId,
  ];

  const result = await pool.query(query, values);

  return result.rows[0] || null;
};

module.exports = {
  createVenue,
  getAllVenues,
  getVenueById,
  updateVenue
};