const pool = require("../config/database");

const createVenueAdmin = async (email, passwordHash) => {
  const query = `
    INSERT INTO venue_admins (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email, created_at, updated_at;
  `;

  const values = [email, passwordHash];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const findVenueAdminByEmail = async (email) => {
  const query = `
    SELECT *
    FROM venue_admins
    WHERE email = $1;
  `;

  const result = await pool.query(query, [email]);

  return result.rows[0] || null;
};

module.exports = {
  createVenueAdmin,
  findVenueAdminByEmail,
};