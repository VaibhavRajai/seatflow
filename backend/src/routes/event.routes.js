const express = require("express");
const eventController = require("../controllers/event.controller");
const eventSectionController = require("../controllers/eventSection.controller");
const authenticate = require("../middleware/auth.middleware");
const { authorizeVenueAdmin } = require("../middleware/role.middleware");

const router = express.Router();

// Admin-specific endpoints (must be defined before /:id)
router.get(
  "/admin",
  authenticate,
  authorizeVenueAdmin,
  eventController.getAdminEvents
);

router.get(
  "/admin/my-events",
  authenticate,
  authorizeVenueAdmin,
  eventController.getAdminEvents
);

router.get(
  "/admin/:id",
  authenticate,
  authorizeVenueAdmin,
  eventController.getAdminEventById
);

// Public event listing
router.get("/", eventController.getAllPublicEvents);

// Admin event creation
router.post(
  "/",
  authenticate,
  authorizeVenueAdmin,
  eventController.createEvent
);

// Public event details by ID
router.get("/:id", eventController.getEventById);

// Admin update event
router.put(
  "/:id",
  authenticate,
  authorizeVenueAdmin,
  eventController.updateEvent
);

// Admin delete event
router.delete(
  "/:id",
  authenticate,
  authorizeVenueAdmin,
  eventController.deleteEvent
);

// Event section pricing CRUD
router.post(
  "/:eventId/sections",
  authenticate,
  authorizeVenueAdmin,
  eventSectionController.addSectionToEvent
);

router.get("/:eventId/sections", eventSectionController.getEventSections);

router.put(
  "/:eventId/sections/:sectionId",
  authenticate,
  authorizeVenueAdmin,
  eventSectionController.updateSectionPrice
);

router.delete(
  "/:eventId/sections/:sectionId",
  authenticate,
  authorizeVenueAdmin,
  eventSectionController.removeSectionFromEvent
);
router.get("/:eventId/seats", eventController.getEventSeats);
router.post(
  "/:eventId/seats/:seatId/hold",
  authenticate,
  eventController.holdSeat
);
module.exports = router;
