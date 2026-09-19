const pool = require("../config/database");

const createBooking = async (client, userId, eventId, totalAmount) => {
  const query = `
    INSERT INTO bookings (
      user_id,
      event_id,
      status,
      total_amount
    )
    VALUES ($1, $2, 'PENDING', $3)
    RETURNING
      id,
      user_id,
      event_id,
      status,
      total_amount,
      created_at,
      updated_at;
  `;

  const result = await client.query(query, [
    userId,
    eventId,
    totalAmount,
  ]);

  return result.rows[0];
};

const createBookingSeat = async (
  client,
  bookingId,
  eventSeatId,
  price
) => {
  const query = `
    INSERT INTO booking_seats (
      booking_id,
      event_seat_id,
      price
    )
    VALUES ($1, $2, $3)
    RETURNING
      id,
      booking_id,
      event_seat_id,
      price,
      created_at;
  `;

  const result = await client.query(query, [
    bookingId,
    eventSeatId,
    price,
  ]);

  return result.rows[0];
};

module.exports = {
  createBooking,
  createBookingSeat,
};