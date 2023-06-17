// Import mongoose ORM
const mongoose = require("mongoose");

// Create user model
const UniformBidModel = new mongoose.Schema(
  {
    itemname: {
      type: String,
      required: true,
    },
    farmerId: {
      type: String,
      required: true,
    },
    itemimage: {
      type: String,
      required: true,
    },
    numberOfBids: {
      type: Number,
      default: 1,
    },
    itemprice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Export this model for import in the routes that will need to use it
module.exports = mongoose.model("UniformBid", UniformBidModel);
