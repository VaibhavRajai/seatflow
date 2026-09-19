const pool = require("../config/database");
const bookingModel = require("../models/booking.model");

const createBooking = async (userId, eventId, eventSeatIds) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /*
     * 1. Lock all requested event seats.
     *    This prevents another transaction from changing them
     *    while we are creating the booking.
     */
    const seatResult = await client.query(
      `
      SELECT
        id,
        event_id,
        status,
        held_by,
        held_until
      FROM event_seats
      WHERE event_id = $1
        AND id = ANY($2::uuid[])
      FOR UPDATE;
      `,
      [eventId, eventSeatIds]
    );

    const seats = seatResult.rows;

    /*
     * Make sure every requested seat actually exists
     * for this event.
     */
    if (seats.length !== eventSeatIds.length) {
      throw new Error("One or more seats are invalid");
    }

    const now = new Date();

    /*
     * 2. Validate every seat.
     */
    for (const seat of seats) {
      if (seat.status !== "HELD") {
        throw new Error(
          "All seats must be held before booking"
        );
      }

      if (seat.held_by !== userId) {
        throw new Error(
          "You can only book seats held by you"
        );
      }

      if (
        !seat.held_until ||
        new Date(seat.held_until) <= now
      ) {
        throw new Error(
          "One or more seat holds have expired"
        );
      }
    }

    /*
     * 3. Get the prices for these seats.
     */
    const priceResult = await client.query(
      `
      SELECT
        es.id AS event_seat_id,
        es.section_id,
        evs.price
      FROM event_seats es
      JOIN seats s
        ON s.id = es.seat_id
      JOIN event_sections evs
        ON evs.event_id = es.event_id
        AND evs.venue_section_id = s.section_id
      WHERE es.event_id = $1
        AND es.id = ANY($2::uuid[]);
      `,
      [eventId, eventSeatIds]
    );

    const seatPrices = priceResult.rows;

    /*
     * 4. Calculate total amount on the backend.
     */
    const totalAmount = seatPrices.reduce(
      (total, seat) => total + Number(seat.price),
      0
    );

    /*
     * 5. Create the booking.
     */
    const booking = await bookingModel.createBooking(
      client,
      userId,
      eventId,
      totalAmount
    );

    /*
     * 6. Create booking_seats records.
     */
    for (const seat of seatPrices) {
      await bookingModel.createBookingSeat(
        client,
        booking.id,
        seat.event_seat_id,
        seat.price
      );
    }

    /*
     * 7. Convert HELD → BOOKED.
     */
    await client.query(
      `
      UPDATE event_seats
      SET
        status = 'BOOKED',
        held_by = NULL,
        held_until = NULL,
        updated_at = NOW()
      WHERE event_id = $1
        AND id = ANY($2::uuid[]);
      `,
      [eventId, eventSeatIds]
    );

    /*
     * 8. Booking is complete.
     */
    await client.query(
      `
      UPDATE bookings
      SET
        status = 'CONFIRMED',
        updated_at = NOW()
      WHERE id = $1;
      `,
      [booking.id]
    );

    await client.query("COMMIT");

    return {
      bookingId: booking.id,
      status: "CONFIRMED",
      totalAmount,
      eventSeatIds,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createBooking,
};