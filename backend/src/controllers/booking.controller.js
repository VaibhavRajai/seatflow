const bookingService = require("../services/booking.service");

const createBooking = async (req, res, next) => {
  try {
    const { eventId, eventSeatIds } = req.body;

    const userId = req.user.userId;

    if (!eventId || !Array.isArray(eventSeatIds) || eventSeatIds.length === 0) {
      return res.status(400).json({
        message: "eventId and eventSeatIds are required",
      });
    }

    const booking = await bookingService.createBooking(
      userId,
      eventId,
      eventSeatIds
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
};