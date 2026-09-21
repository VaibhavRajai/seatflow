const pool = require("../config/database");
const bookingModel = require("../models/booking.model");
const paymentModel = require("../models/payment.model");

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
        throw new Error("All seats must be held before booking");
      }

      if (seat.held_by !== userId) {
        throw new Error("You can only book seats held by you");
      }

      if (
        !seat.held_until ||
        new Date(seat.held_until) <= now
      ) {
        throw new Error("One or more seat holds have expired");
      }
    }

    /*
     * 3. Get the prices for these seats.
     */
    const priceResult = await client.query(
  `
  SELECT
    es.id AS event_seat_id,
    s.section_id,
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
     *
     * Booking remains PENDING because
     * payment has not happened yet.
     */
    const booking = await bookingModel.createBooking(
      client,
      userId,
      eventId,
      totalAmount
    );

    /*
     * 6. Create the payment record.
     *
     * Payment starts with CREATED status.
     */
    const payment = await paymentModel.createPayment(
      client,
      booking.id,
      totalAmount
    );

    /*
     * 7. Attach all selected seats to the booking.
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
     * Do NOT convert seats to BOOKED yet.
     *
     * Current state:
     *
     * Seat    -> HELD
     * Booking -> PENDING
     * Payment -> CREATED
     *
     * After successful payment, we will:
     *
     * Seat    -> BOOKED
     * Booking -> CONFIRMED
     * Payment -> SUCCESS
     */

    await client.query("COMMIT");

    return {
      bookingId: booking.id,
      paymentId: payment.id,
      status: "PENDING",
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
