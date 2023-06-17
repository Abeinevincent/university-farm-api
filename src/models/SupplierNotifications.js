// Import mongoose ORM
const mongoose = require("mongoose");

// Create Notifications model
const SupplierNotificationsModel = new mongoose.Schema(
  {
    supplierId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Export this model for import in the routes that will need to use it
module.exports = mongoose.model(
  "SupplierNotifications",
  SupplierNotificationsModel
);
