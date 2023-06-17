// Import mongoose ORM
const mongoose = require("mongoose");

// Create Farmer model
const FarmerInDistrictModel = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
      unique: true,
    },
    farmerCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Export this model for import in the routes that will need to use it
module.exports = mongoose.model("FarmerInDistrictModel", FarmerInDistrictModel);
