// Import mongoose ORM
const mongoose = require("mongoose");

// Create user model
const PaymentsModel = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    notification_id: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    order_tracking_id: {
      type: String,
      required: true,
      unique: true,
    },
    merchant_reference: {
      type: String,
      required: true,
      unique: true,
    },
    full_name: {
      type: String,
    },
    city: {
      type: String,
    },
    email_address: {
      type: String,
    },
    seen_farmer_details: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      required: true,
      default: "not_cleared", // other values are values returned by the payment gateway
    },
  },
  { timestamps: true }
);

// Export this model for import in the routes that will need to use it
module.exports = mongoose.model("Payments", PaymentsModel);
