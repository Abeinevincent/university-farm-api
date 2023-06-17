// socket.js
const io = require("socket.io");
const BidItem = require("./src/models/BidItem");
const BidService = require("./src/services/BidService");
const BidCroneJob = require("./src/services/cron/bid.cron");
module.exports = (server) => {
  const socketServer = io(server);
  socketServer.on("connection", (socket) => {
    // greetings (test)
    socket.on("salutation", (data) => {
      socketServer.emit("greeting", data);
    });

    // join room
    socket.on("joinBuyerRoom", (buyerId) => {
      socket.join(`buyer:${buyerId}`);
    });

    socket.on("bidAccepted", async (buyerId) => {
      // Get bid from MongoDB using Mongoose
      const bid = await BidItem.findOne({ _id: buyerId });
      const autionSettings = await BidCroneJob.getAuctionSettings();

      // Send popup message to the buyer whose bid was accepted
      socketServer
        .to(`buyer:${buyerId}`)
        .emit("bidAcceptedPopup", { bid, autionSettings });
    });

    // buyer accepted to purchase farmer details
    socket.on("acceptedPurchase", async (bidId) => {
      const bid = await BidItem.findOne({ _id: bidId });
      await BidService.createBidTimeline(bid, true);
      const autionSettings = await BidCroneJob.getAuctionSettings();
      const message = `
            You have accepted to purchase the Farmer's Contacts successfully. 
            Your bid will automatically be canceled if you failed to make payments 
            in the next ${autionSettings.periodToPurchase} minutes.
            `;
      socketServer
        .to(`buyer:${bid.buyerId}`)
        .emit("buyerAcceptedPurchase", { message });
    });
  });
};
