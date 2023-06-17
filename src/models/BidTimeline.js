const mongoose = require('mongoose');

const bidTimelineSchema = new mongoose.Schema({
    bidId: {
        type: String,
        required: true,
    },

    statusText: {
        type: String
    },

    acceptedPurchase: {
        type: Boolean,
        default: false,
    },

    acceptedPurchaseAt: {
        type: Date,
    },

    purchasedDetails: {
        type: Boolean,
        default: false,
    },

    purchasedDetailsAt: {
        type: Date,
    },

    auctionId: {
        type: String
    },


}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    }
});

bidTimelineSchema.virtual("bid", {
    ref: "BidItem",
    localField: "bidId",
    foreignField: "_id"
});

module.exports = mongoose.model('BidTimeline', bidTimelineSchema);