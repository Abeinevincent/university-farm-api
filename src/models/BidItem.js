// Import mongoose ORM
const mongoose = require("mongoose");

// Create user model
const BidItemModel = new mongoose.Schema(
  {
    itemname: {
      type: String,
      required: true,
    },
    buyername: {
      type: String,
      required: true,
    },
    itemquantity: {
      type: Number,
      required: true,
    },
    quantitybuyerneeds: {
      type: Number,
      required: true,
    },
    itemprice: {
      type: String,
      required: true,
    },
    buyerContact: {
      type: String,
      required: true,
    },
    buyerprice: {
      type: Number,
      required: true,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "Fresh Bid", //can also be pending(buyer made a bid and farmer hasnt accepted) or farmeraccepted the bid, etc
    },
    accepteddate: {
      type: String,
    },
    buyerResponded: {
      type: Boolean,
      default: false
    },
    acceptedtime: {
      type: String,
    },
    buyerId: {
      type: String,
      required: true,
    },
    farmerId: {
      type: String,
      required: true,
    },
    auctionId: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtuals

BidItemModel.virtual("farmer", {
  ref: "Farmer",
  localField: "farmerId",
  foreignField: "_id",
});

BidItemModel.virtual("buyer", {
  ref: "Buyer",
  localField: "buyerId",
  foreignField: "_id",
});
// Export this model for import in the routes that will need to use it
module.exports = mongoose.model("BidItem", BidItemModel);
