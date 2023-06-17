const mongoose = require('mongoose');

const auctionSettingSchema = new mongoose.Schema({
    /**
     * The period in minutes in which the buyer should click on buy farmer details 
     * after the farmer acceppts the bid
     * 
     * Defaults to: 5 minutes
     */
    periodToAcceptPurchase: {
        type: Number,
        default: 5,
    },

    /**
     * The period in minutes in which the buyer should  buy farmer details 
     * after they have chosen to buy farmer contact information
     * 
     */
    periodToPurchase: {
        type: Number,
        default: 30,
    },

    settingType: {
        type: String,
        default: 'auction',
    },

}, {
    timestamps: true,
});

module.exports = mongoose.model("AuctionSetting", auctionSettingSchema);