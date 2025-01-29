const express = require("express");
const {
  createPaymentLink,
  verifyPayment,
  handleWebhook,
} = require("../controllers/flutterwave.controllers");
const {
  handleSetTimer,
} = require("../controllers/reminderController.controllers");
const reminderRouter = express.Router();

reminderRouter.get("/set-timer", handleSetTimer);
reminderRouter.post("/generate-payment-link", createPaymentLink);
reminderRouter.get("/verify-payment/:tx_id", verifyPayment);
reminderRouter.post("/webhook", handleWebhook);

module.exports = reminderRouter;
