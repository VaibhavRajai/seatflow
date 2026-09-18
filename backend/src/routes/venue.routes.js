const express = require("express");
const venueController = require("../controllers/venue.controller");
const venueAreaController = require("../controllers/venueArea.controller");
const venueSectionController = require("../controllers/venueSection.controller");
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

// Area routes under venue
router.post(
  "/:venueId/areas",
  authenticate,
  authorizeVenueAdmin,
  venueAreaController.createVenueArea
);

router.get(
  "/:venueId/areas",
  venueAreaController.getVenueAreasByVenue
);

// Venue layout route
router.get(
  "/:venueId/layout",
  venueSectionController.getVenueLayout
);

module.exports = router;