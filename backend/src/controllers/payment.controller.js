const paymentService = require("../services/payment.service");
const crypto=require('crypto')
const createOrder = async (req, res, next) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        message: "paymentId is required",
      });
    }

    const result = await paymentService.createRazorpayOrder(
      paymentId
    );

    res.status(200).json({
      message: "Razorpay order created successfully",
      payment: result,
    });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { paymentId, providerPaymentId } = req.body;

    if (!paymentId || !providerPaymentId) {
      return res.status(400).json({
        message: "PaymentId and providerPaymentId are required",
      });
    }

    const result = await paymentService.confirmPayment(
      paymentId,
      providerPaymentId
    );

    res.status(200).json({
      message: "Payment confirmed successfully",
      payment: result,
    });
  } catch (error) {
    next(error);
  }
};

const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      return res.status(400).json({
        message: "Missing Razorpay signature",
      });
    }

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
      .update(req.rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({
        message: "Invalid webhook signature",
      });
    }

    const result = await paymentService.processWebhook(
      req.body
    );

    return res.status(200).json({
      received: true,
      result,
    });
  } catch (error) {
    next(error);
  }
};
const failPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        message: "paymentId is required",
      });
    }

    const result = await paymentService.failPayment(paymentId);

    res.status(200).json({
      message: "Payment marked as failed",
      payment: result,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createOrder,
  confirmPayment,
  handleWebhook,
  failPayment
};
