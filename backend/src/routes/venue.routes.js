const express = require("express");
const venueController = require("../controllers/venue.controller");
const authenticate = require("../middleware/auth.middleware");
const { authorizeVenueAdmin } = require("../middleware/role.middleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeVenueAdmin,
  venueController.createVenue
);

router.get(
  "/",
  venueController.getAllVenues
);
router.get(
  "/:id",
  venueController.getVenueById
);
router.put(
  "/:id",
  authenticate,
  authorizeVenueAdmin,
  venueController.updateVenue
);
module.exports = router;