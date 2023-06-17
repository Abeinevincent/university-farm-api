const mongoose = require('mongoose');
const auctionSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
    },

    itemname: {
        type: String
    },
    auctionStatus: {
        type: String,
        default: 'open',
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
}, );

auctionSchema.virtual('bidItems', {
    ref: 'BidItem',
    localField: '_id',
    foreignField: 'auctionId',
});

module.exports = mongoose.model('Auction', auctionSchema);