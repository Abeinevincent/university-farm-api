const cron = require("node-cron");
const BidItem = require("../models/BidItem");
const Graph = require("../models/Graph");

const calculateAverageBid = async (startTime, endTime) => {
  const bids = await BidItem.find({
    createdAt: {
      $gte: startTime,
      $lte: endTime,
    },
  });

  const totalBids = bids.length;
  const sumOfBids = bids.reduce((acc, bid) => acc + bid.buyerprice, 0);

  if (totalBids === 0) {
    return 0;
  }

  return sumOfBids / totalBids;
};

const scheduleGraphCreation = () => {
  cron.schedule("0 7-23/1 * * *", async () => {
    const currentTime = new Date();
    const startTime = new Date(currentTime);
    startTime.setMinutes(0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + 30);

    const averageBid = await calculateAverageBid(startTime, endTime);

    const graphData = new Graph({
      itemname: "Sample Item", // Update with the appropriate item name
      yAxis: averageBid,
      xAxis: startTime,
      timerange: `${startTime.getHours()}:${startTime.getMinutes()} - ${endTime.getHours()}:${endTime.getMinutes()}`,
    });

    const savedGraphData = await graphData.save();
    console.log(savedGraphData, "graph data ---");
  });

  //   START THE CRON JOB
  //   cron.start();
};

module.exports = {
  scheduleGraphCreation,
};
