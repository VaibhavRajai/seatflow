const express = require("express");
const paymentController = require("../controllers/payment.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/order",
  authenticate,
  paymentController.createOrder
);

router.post(
  "/confirm",
  authenticate,
  paymentController.confirmPayment
);
router.post(
  "/webhook",
  paymentController.handleWebhook
);
router.post("/fail", authenticate, paymentController.failPayment);
module.exports = router;