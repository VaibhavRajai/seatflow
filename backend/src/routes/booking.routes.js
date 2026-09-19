const express = require("express");
const bookingController = require("../controllers/booking.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  bookingController.createBooking
);

module.exports = router;