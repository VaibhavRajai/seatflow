const pool = require("../config/database");

const createVenueSection = async (
  venueAreaId,
  name,
  capacity,
  rowsCount,
  seatsPerRow
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const sectionQuery = `
      INSERT INTO venue_sections (
        venue_area_id,
        name,
        capacity,
        rows_count,
        seats_per_row
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        venue_area_id,
        name,
        capacity,
        rows_count,
        seats_per_row,
        created_at,
        updated_at;
    `;

    const sectionResult = await client.query(sectionQuery, [
      venueAreaId,
      name,
      capacity,
      rowsCount,
      seatsPerRow,
    ]);

    const section = sectionResult.rows[0];

    for (let row = 0; row < rowsCount; row++) {
      const rowLabel = String.fromCharCode(65 + row);

      for (let seat = 1; seat <= seatsPerRow; seat++) {
        await client.query(
          `
          INSERT INTO seats (
            section_id,
            row_label,
            seat_number
          )
          VALUES ($1, $2, $3);
          `,
          [section.id, rowLabel, seat]
        );
      }
    }

    await client.query("COMMIT");

    return section;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getVenueLayout = async (venueId) => {
  const query = `
    SELECT
      va.id AS area_id,
      va.name AS area_name,
      va.description AS area_description,
      va.created_at AS area_created_at,

      vs.id AS section_id,
      vs.name AS section_name,
      vs.capacity,
      vs.rows_count,
      vs.seats_per_row,
      vs.created_at AS section_created_at,

      s.id AS seat_id,
      s.row_label,
      s.seat_number

    FROM venue_areas va

    LEFT JOIN venue_sections vs
      ON vs.venue_area_id = va.id

    LEFT JOIN seats s
      ON s.section_id = vs.id

    WHERE va.venue_id = $1

    ORDER BY
      va.created_at ASC,
      va.name ASC,
      vs.created_at ASC,
      vs.name ASC,
      s.row_label ASC,
      s.seat_number ASC;
  `;

  const result = await pool.query(query, [venueId]);

  return result.rows;
};

const getVenueSectionsByAreaId = async (venueAreaId) => {
  const query = `
    SELECT
      id,
      venue_area_id,
      name,
      capacity,
      rows_count,
      seats_per_row,
      created_at,
      updated_at
    FROM venue_sections
    WHERE venue_area_id = $1
    ORDER BY created_at ASC, name ASC;
  `;

  const result = await pool.query(query, [venueAreaId]);
  return result.rows;
};

module.exports = {
  createVenueSection,
  getVenueLayout,
  getVenueSectionsByAreaId,
};