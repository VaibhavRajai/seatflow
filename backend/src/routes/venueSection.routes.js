const express = require("express");
const venueSectionController = require("../controllers/venueSection.controller");
const authenticate = require("../middleware/auth.middleware");
const { authorizeVenueAdmin } = require("../middleware/role.middleware");

const router = express.Router();

router.post(
  "/:venueAreaId/sections",
  authenticate,
  authorizeVenueAdmin,
  venueSectionController.createVenueSection
);

module.exports = router;