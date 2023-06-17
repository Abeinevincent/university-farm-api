// Import mongoose ORM
const mongoose = require("mongoose");

// Create user model
const GraphModel = new mongoose.Schema(
  {
    itemname: {
      type: String,
      required: true,
    },
    timerange: {
      type: String, // e.g 9: 30am - 1: 00pm
      required: true,
    },
    xAxis: {
      type: String,
      required: true,
    },
    yAxis: {
      type: Number,
      required: true,
    },
    averagePrice: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Export this model for import in the routes that will need to use it
module.exports = mongoose.model("Graph", GraphModel);
