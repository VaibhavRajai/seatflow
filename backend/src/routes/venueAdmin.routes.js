const express = require("express");
const venueAdminController = require("../controllers/venueAdmin.controller");

const router = express.Router();

router.post("/signup", venueAdminController.signup);

router.post("/login", venueAdminController.login);

router.post("/logout", venueAdminController.logout);

module.exports = router;