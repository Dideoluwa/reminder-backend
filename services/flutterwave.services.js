const axios = require("axios");
require("dotenv").config();
const crypto = require("crypto");

const FLW_URL = process.env.FLW_URL;
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const FLW_SECRET_HASH = process.env.FLW_SECRET_HASH;

const verifyFlutterwaveSignature = (req) => {
  console.log(req.headers["verif-hash"]);
  return FLW_SECRET_HASH === req.headers["verif-hash"];
};

const generatePaymentLink = async ({
  totalAmount,
  currency = "NGN",
  email,
  phone,
  tx_ref,
  name,
}) => {
  try {
    const response = await axios.post(
      `${FLW_URL}/payments`,
      {
        tx_ref,
        amount: totalAmount,
        currency,
        redirect_url: "http://localhost:8081/api/v1/",
        customer: {
          email,
          phonenumber: phone,
          name: name,
        },
        customizations: {
          title: "BuyCredits",
          description: "Automate Your Airtime Renewal",
        },
        payment_options: "card",
        authorization: {
          mode: "pin",
        },
        meta: {
          tokenization: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status !== "success") {
      throw new Error(response.data.message);
    }

    return {
      status: "success",
      message: "Payment link generated successfully",
      paymentLink: response.data.data,
    };
  } catch (error) {
    const errorMessage = error.response?.data.errors || error.message.errors;
    console.log("Error generating payment link:", errorMessage[0].message);

    throw new Error("Error generating payment link:", errorMessage[0].message);
  }
};

const verifyPayment = async (tx_id) => {
  try {
    const response = await axios.get(
      `${FLW_URL}/transactions/${tx_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status !== "success") {
      throw new Error(response.data.message);
    }
    // console.log(response);
    return {
      status: "success",
      message: "Payment verified successfully",
      data: response.data,
    };
  } catch (error) {
    const errorMessage = error.response?.data.errors || error.message.errors;
    console.log("Error verifying payment:", errorMessage[0].message);

    throw new Error("Error verifying payment:", errorMessage[0].message);
  }
};

const handleWebhook = async (req) => {
  const payload = req.body;
  try {
    if (!verifyFlutterwaveSignature(req)) {
      return {
        status: "error",
        message: "Invalid signature",
      };
    }
    console.log(payload);
    if (
      payload["event.type"] === "CARD_TRANSACTION" &&
      payload.status === "successful"
    ) {
      const transactionId = payload.id;

      const verifiedTransaction = await verifyPayment(transactionId);

      if (
        verifiedTransaction.data.status === "success" &&
        verifiedTransaction.data.data.status === "successful"
      ) {
        console.log(
          "Payment verified successfully:",
          verifiedTransaction.data.data
        );
        return {
          status: "success",
          message: "Webhook received and payment verified successfully",
        };
      }
    } else {
      console.error("Event not handled or unsuccessful payment");
      return {
        status: "error",
        message: "Event not handled or unsuccessful payment",
      };
    }
  } catch (error) {
    console.error("Error handling webhook:", error.message);
    return {
      status: "error",
      message: "Internal Server Error",
    };
  }
};

module.exports = {
  generatePaymentLink,
  verifyPayment,
  handleWebhook,
};
