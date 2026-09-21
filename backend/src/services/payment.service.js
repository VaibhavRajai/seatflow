const pool = require("../config/database");
const paymentModel = require("../models/payment.model");
const webhookEventModel=require('../models/webhookEvent.model')
const razorpay=require('../config/razorpay')

const confirmPayment = async (
  paymentId,
  providerPaymentId
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /*
     * 1. Find the payment.
     */
    const payment = await paymentModel.getPaymentById(
      client,
      paymentId
    );

    if (!payment) {
      throw new Error("Payment not found");
    }

    /*
     * 2. Make sure this payment has not already
     *    been successfully processed.
     *
     * This makes the operation idempotent.
     */
    if (payment.status === "SUCCESS") {
      await client.query("COMMIT");

      return {
        paymentId: payment.id,
        bookingId: payment.booking_id,
        status: "SUCCESS",
      };
    }

    if (payment.status !== "CREATED") {
      throw new Error("Payment cannot be confirmed");
    }

    /*
     * 3. Mark payment as successful.
     */
    const updatedPayment =
      await paymentModel.updatePaymentStatus(
        client,
        paymentId,
        "SUCCESS",
        providerPaymentId
      );

    /*
     * 4. Lock the booking.
     *
     * We don't want another transaction changing
     * this booking while we confirm the payment.
     */
    const bookingResult = await client.query(
      `
      SELECT
        id,
        user_id,
        event_id,
        status,
        total_amount
      FROM bookings
      WHERE id = $1
      FOR UPDATE;
      `,
      [payment.booking_id]
    );

    const booking = bookingResult.rows[0];

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "PENDING") {
      throw new Error("Booking is not pending");
    }

    /*
     * 5. Find all seats belonging to this booking
     *    and lock them.
     */
    const seatResult = await client.query(
      `
      SELECT
        es.id,
        es.event_id,
        es.seat_id,
        es.status,
        es.held_by,
        es.held_until
      FROM booking_seats bs
      JOIN event_seats es
        ON es.id = bs.event_seat_id
      WHERE bs.booking_id = $1
      FOR UPDATE;
      `,
      [booking.id]
    );

    const seats = seatResult.rows;

    if (seats.length === 0) {
      throw new Error("No seats found for booking");
    }

    /*
     * 6. Make sure every seat is still held.
     */
    const now = new Date();

    for (const seat of seats) {
      if (seat.status !== "HELD") {
        throw new Error(
          "One or more seats are no longer held"
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
      WHERE id = ANY($1::uuid[]);
      `,
      [seats.map((seat) => seat.id)]
    );

    /*
     * 8. Convert Booking PENDING → CONFIRMED.
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
      paymentId: updatedPayment.id,
      bookingId: booking.id,
      status: "SUCCESS",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const createRazorpayOrder=async(paymentId)=>{
    const client=await pool.connect();
    try{
        await client.query("BEGIN");

        const payment=await paymentModel.getPaymentById(client,paymentId);
        if(!payment){
            throw new Error("Payment not found")
        }
        if(payment.status!=="CREATED"){
            throw new Error("Payment is not available for order creation")
        }
        if(payment.provider_order_id){
            await client.query("COMMIT");
            return {
                 paymentId: payment.id,
        orderId: payment.provider_order_id,
        amount: payment.amount,
        currency: "INR",
            }
        }
        const razorpayOrder=await razorpay.orders.create({
            amount:Math.round(Number(payment.amount)*100),
            currency:"INR",
            receipt:payment.id
        });
        await paymentModel.updateProviderOrderId(
            client,payment.id,razorpayOrder.id
        );
        await client.query("COMMIT");
         return {
      paymentId: payment.id,
      orderId: razorpayOrder.id,
      amount: payment.amount,
      currency: "INR",
    };
    }
   catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const processWebhook = async (event) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const eventId = event.id;
    const eventType = event.event;

    if (!eventId || !eventType) {
      throw new Error("Invalid webhook payload");
    }

    /*
     * Try to record this webhook event.
     *
     * If the event already exists, createWebhookEvent()
     * returns null because of ON CONFLICT DO NOTHING.
     */
    const webhookEvent =
      await webhookEventModel.createWebhookEvent(
        client,
        "RAZORPAY",
        eventId,
        eventType
      );

    /*
     * Same webhook has already been received.
     *
     * Nothing else needs to be done.
     */
    if (!webhookEvent) {
      await client.query("ROLLBACK");

      return {
        alreadyProcessed: true,
      };
    }

    /*
     * For now, we only handle order.paid.
     */
    if (eventType !== "order.paid") {
      await webhookEventModel.markWebhookEventProcessed(
        client,
        webhookEvent.id
      );

      await client.query("COMMIT");

      return {
        alreadyProcessed: false,
        ignored: true,
      };
    }

    /*
     * Razorpay order ID from the webhook.
     */
    const razorpayOrderId = event.payload.order.entity.id;

    /*
     * Find our payment using the Razorpay order ID.
     */
    const paymentResult = await client.query(
      `
      SELECT
        id,
        booking_id,
        amount,
        status,
        provider_order_id
      FROM payments
      WHERE provider = 'RAZORPAY'
        AND provider_order_id = $1
      FOR UPDATE;
      `,
      [razorpayOrderId]
    );

    const payment = paymentResult.rows[0];

    if (!payment) {
      throw new Error(
        "Payment not found for Razorpay order"
      );
    }

    /*
     * If our payment is already successful,
     * there is nothing more to do.
     */
    if (payment.status === "SUCCESS") {
      await webhookEventModel.markWebhookEventProcessed(
        client,
        webhookEvent.id
      );

      await client.query("COMMIT");

      return {
        alreadyProcessed: false,
        paymentAlreadySuccessful: true,
      };
    }

    /*
     * Payment must still be in CREATED state.
     */
    if (payment.status !== "CREATED") {
      throw new Error("Payment cannot be processed");
    }

    /*
     * Mark payment as SUCCESS.
     */
    await paymentModel.updatePaymentStatus(
      client,
      payment.id,
      "SUCCESS",
      event.payload.payment.entity.id
    );

    /*
     * Lock the booking.
     */
    const bookingResult = await client.query(
      `
      SELECT
        id,
        user_id,
        event_id,
        status,
        total_amount
      FROM bookings
      WHERE id = $1
      FOR UPDATE;
      `,
      [payment.booking_id]
    );

    const booking = bookingResult.rows[0];

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "PENDING") {
      throw new Error("Booking is not pending");
    }

    /*
     * Lock all seats belonging to the booking.
     */
    const seatResult = await client.query(
      `
      SELECT
        es.id,
        es.status,
        es.held_by,
        es.held_until
      FROM booking_seats bs
      JOIN event_seats es
        ON es.id = bs.event_seat_id
      WHERE bs.booking_id = $1
      FOR UPDATE;
      `,
      [booking.id]
    );

    const seats = seatResult.rows;

    if (seats.length === 0) {
      throw new Error("No seats found for booking");
    }

    /*
     * Make sure the seats are still held.
     */
    const now = new Date();

    for (const seat of seats) {
      if (seat.status !== "HELD") {
        throw new Error(
          "One or more seats are no longer held"
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
     * Convert HELD → BOOKED.
     */
    await client.query(
      `
      UPDATE event_seats
      SET
        status = 'BOOKED',
        held_by = NULL,
        held_until = NULL,
        updated_at = NOW()
      WHERE id = ANY($1::uuid[]);
      `,
      [seats.map((seat) => seat.id)]
    );

    /*
     * Convert PENDING → CONFIRMED.
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

    /*
     * Mark webhook as successfully processed.
     */
    await webhookEventModel.markWebhookEventProcessed(
      client,
      webhookEvent.id
    );

    await client.query("COMMIT");

    return {
      alreadyProcessed: false,
      paymentId: payment.id,
      bookingId: booking.id,
      status: "SUCCESS",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
const failPayment = async (paymentId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Lock the payment
    const payment = await paymentModel.getPaymentById(
      client,
      paymentId
    );

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Payment is already successful → never downgrade it
    if (payment.status === "SUCCESS") {
      throw new Error("Successful payment cannot be failed");
    }

    if (payment.status !== "CREATED") {
      throw new Error("Payment cannot be failed");
    }

    // 2. Lock the booking
    const bookingResult = await client.query(
      `
      SELECT
        id,
        user_id,
        event_id,
        status,
        total_amount
      FROM bookings
      WHERE id = $1
      FOR UPDATE;
      `,
      [payment.booking_id]
    );

    const booking = bookingResult.rows[0];

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "PENDING") {
      throw new Error("Booking is not pending");
    }

    // 3. Lock all seats belonging to the booking
    const seatResult = await client.query(
      `
      SELECT
        es.id,
        es.status,
        es.held_by,
        es.held_until
      FROM booking_seats bs
      JOIN event_seats es
        ON es.id = bs.event_seat_id
      WHERE bs.booking_id = $1
      FOR UPDATE;
      `,
      [booking.id]
    );

    const seats = seatResult.rows;

    if (seats.length === 0) {
      throw new Error("No seats found for booking");
    }

    // 4. Make sure seats are still HELD
    for (const seat of seats) {
      if (seat.status !== "HELD") {
        throw new Error(
          "One or more seats are no longer held"
        );
      }
    }

    // 5. Payment CREATED → FAILED
    const failedPayment =
      await paymentModel.markPaymentFailed(
        client,
        paymentId
      );

    if (!failedPayment) {
      throw new Error("Payment could not be marked as failed");
    }

    // 6. Release seats
    await client.query(
      `
      UPDATE event_seats
      SET
        status = 'AVAILABLE',
        held_by = NULL,
        held_until = NULL,
        updated_at = NOW()
      WHERE id = ANY($1::uuid[]);
      `,
      [seats.map((seat) => seat.id)]
    );

    // 7. Booking PENDING → CANCELLED
    await client.query(
      `
      UPDATE bookings
      SET
        status = 'CANCELLED',
        updated_at = NOW()
      WHERE id = $1;
      `,
      [booking.id]
    );

    await client.query("COMMIT");

    return {
      paymentId: failedPayment.id,
      bookingId: booking.id,
      status: "FAILED",
      bookingStatus: "CANCELLED",
      seatsReleased: seats.map((seat) => seat.id),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
module.exports = {
  confirmPayment,
  createRazorpayOrder,
  processWebhook,
  failPayment
};