const paymentService = require("../services/flutterwave.services");
const { v4: uuidv4 } = require("uuid");

const calculateTotalAmount = (desiredAmount, feePercentage) => {
  return (desiredAmount / (1 - feePercentage)).toFixed(2);
};

const createPaymentLink = async (req, res) => {
  try {
    const {
      amount,
      currency = "NGN",
      email,
      phone,
      tx_ref = `tx-${uuidv4()}`,
      name,
    } = req.body;

    const feePercentage = currency === "NGN" ? 1.4 / 100 : 3.8 / 100;
    const totalAmount = calculateTotalAmount(amount, feePercentage);

    // Validate required fields
    if (!totalAmount || !email || !tx_ref || !name) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: totalAmount, email, or tx_ref",
      });
    }

    const result = await paymentService.generatePaymentLink({
      totalAmount,
      currency,
      email,
      phone,
      tx_ref,
      name,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.response?.data || error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { tx_id } = req.params;

    if (!tx_id) {
      return res.status(400).json({
        status: "error",
        message: "Missing required field: tx_id",
      });
    }

    const result = await paymentService.verifyPayment(tx_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.response?.data || error.message,
    });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const result = await paymentService.handleWebhook(req);
    if (result.status === "success") {
      return res.status(200).json({
        status: "success",
        message: result.message,
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Error handling webhook:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createPaymentLink,
  verifyPayment,
  handleWebhook,
};
