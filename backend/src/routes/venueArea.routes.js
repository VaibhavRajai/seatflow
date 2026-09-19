const express = require("express");
const venueAreaController = require("../controllers/venueArea.controller");
const venueSectionController = require("../controllers/venueSection.controller");
const authenticate = require("../middleware/auth.middleware");
const { authorizeVenueAdmin } = require("../middleware/role.middleware");

const router = express.Router();

router.get("/:id", venueAreaController.getVenueAreaById);

router.get("/:venueAreaId/sections", venueSectionController.getSectionsByArea);

router.post(
  "/:venueAreaId/sections",
  authenticate,
  authorizeVenueAdmin,
  venueSectionController.createVenueSection
);

module.exports = router;
