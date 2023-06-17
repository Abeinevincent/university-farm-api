const router = require("express").Router();
const BidItem = require("../../models/BidItem");
const BidService = require("../../services/BidService");
const moment = require("moment");
const UniformBid = require("../../models/UniformBid");
const FarmerProduce = require("../../models/FarmerProduce");
const FarmerSpecifics = require("../../models/FarmerSpecifics");
const AllProduce = require("../../models/AllProduce");
const Payments = require("../../models/Payments");
const Graph = require("../../models/Graph");

// Create bidItems*********************************************************************
router.post("/", async (req, res) => {
  try {
    const newBidItem = await BidService.bidOnAnAuction(req.body);
    if (newBidItem === 0) {
      return res.status(200).json({
        message: "This auction was closed and does not accept bids any more!",
        bid: newBidItem,
      });
    }
    return res.status(200).json({
      message: "Bid successfully submitted!",
      bid: newBidItem,
    });
  } catch (err) {
    console.log(err, "Error occured creating bid");
    return res.status(500).json(err);
  }
});

// Update bid item ************************************************************
router.put("/:id", async (req, res) => {
  try {
    const updatedItem = await BidService.updateBidItem(req.params.id, req.body);
    return res.status(200).json({
      message: "Bid Item has been updated successfully!",
      updatedItem,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json(res);
  }
});

// Get all bidItems of a partcular farmer's produce ***************************
router.get("/findbids/:farmerId/:itemname", async (req, res) => {
  try {
    const bidItems = await BidItem.find({
      farmerId: req.params.farmerId,
      itemname: req.params.itemname,
    })
      .sort({ buyerprice: -1, createdAt: -1 })
      .limit(5);
    return res.status(200).json(bidItems);
  } catch (err) {
    console.log(err);
    return res.status(200).json(err);
  }
});

// GET ALL BIDS WHERE ACCEPTED PRICE AND ACCEPTED TIME IS NOT NULL *********************************
router.get("/findbids/acceptedones", async (req, res) => {
  try {
    const boughtItems = await BidItem.find({
      accepteddate: { $exists: true, $ne: null },
      acceptedtime: { $exists: true, $ne: null },
    });
    return res.status(200).json(boughtItems);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// GET ALL BIDS WHERE ACCEPTED PRICE AND ACCEPTED TIME IS NOT NULL FOR A PARTICLUAR PRODUCE *********************************
router.get("/findbids/acceptedones/byitem/:itemname", async (req, res) => {
  try {
    const boughtItems = await BidItem.find({
      accepteddate: { $exists: true, $ne: null },
      acceptedtime: { $exists: true, $ne: null },
      itemname: req.params.itemname,
    }).sort({ createdAt: -1 });

    return res.status(200).json(boughtItems);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.get("/graph", async (req, res) => {
  try {
    const currentTime = moment();

    const startTime = moment(currentTime).subtract(2, "hours");

    const start = startTime.toDate(); // Convert to a Date object
    const end = currentTime.toDate(); // Convert to a Date object

    const interval = 30 * 60 * 1000; // 30 minutes in milliseconds

    const data = await BidService.fetchBidItems(start, end, interval);
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// accept bid
router.put("/accept/:id", async (req, res) => {
  try {
    const bidAccepted = await BidService.acceptBid(req.params.id);

    if (bidAccepted === 0) {
      return res.status(200).json({
        message:
          "You have already accepted a Bid on this auction. Congraturations!.",
      });
    }
    return res.status(200).json({
      message: "Bid accepted successfully. The buyer has been informed.",
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

router.get("/", async (req, res) => {
  try {
    const { filter } = req.query;
    delete req.query.filter;

    const bidItems = await BidService.getBidItems(filter, req.query);
    return res.status(200).json(bidItems);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// SIMPLIFIED END POINTS**************************************************************************
// CREATE  A BID
router.post("/newbid", async (req, res) => {
  try {
    const { farmerId, buyerId, quantitybuyerneeds, itemname, itemquantity } =
      req.body;
    // Check if the buyer trying to bid has already made a bid on this very item of the same farmer
    const alreadyBidItem = await BidItem.findOne({
      farmerId,
      buyerId,
      itemname,
      itemquantity,
    });

    // CHECK FOR QUANTITY BEING BID

    const availableItemQuantity = await FarmerProduce.findOne({
      farmerId,
      itemname,
    });

    if (availableItemQuantity.itemquantity < quantitybuyerneeds) {
      return res.status(403).json("Cannot bid higher than available quantity!");
    } else {
      if (alreadyBidItem) {
        return res
          .status(400)
          .json("You have already submitted a bid for this item!");
      } else {
        const newBid = new BidItem(req.body);
        const savedBid = await newBid.save();

        //   CREATE A UNIFORM BID HERE(CAPTURES NUMBER OF BIDS PER ITEM)
        //   REGISTER FARMER IN DISTRICT HERE *******
        try {
          const existingBid = await UniformBid.findOneAndUpdate(
            { farmerId: req.body.farmerId, itemname: req.body.itemname },
            { $inc: { numberOfBids: 1 } },
            { new: true }
          );
          if (existingBid) {
            existingBid.numberOfBids += 1;
            console.log("field updated");
          } else {
            const { farmerId, itemname, itemprice, itemimage } = req.body;
            const newUniformBid = new UniformBid({
              farmerId,
              itemname,
              itemprice,
              itemimage,
            });
            const savedUniformBid = await newUniformBid.save();
            console.log(savedUniformBid);
          }
        } catch (err) {
          console.log(err);
          res.status(500).json(err);
        }

        return res.status(201).json(savedBid);
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// FIND GRAPH DATA BY ITEMNAME AND TIMERANGE
router.get("/graphdata/:itemname/:timerange", async (req, res) => {
  try {
    const { itemname, timerange } = req.params;
    const graphdata = await Graph.find({ itemname, timerange });
    return res.status(200).json(graphdata);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// FIND BIDS BY FARMERID AND ITEMNAME ***
router.get("/findbidsbyfarmerId/:farmerId/:itemname", async (req, res) => {
  try {
    const { farmerId, itemname } = req.params;

    const bidItems = await BidItem.find({
      farmerId,
      itemname,
    });
    return res.status(200).json(bidItems);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// FIND UNIFORM BIDS BY FARMERID ***
router.get("/finduniformbidsbyfarmerId/:farmerId", async (req, res) => {
  try {
    const { farmerId, itemname } = req.params;

    const bidItems = await UniformBid.find({
      farmerId,
    });
    return res.status(200).json(bidItems);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// UPDATE BID UPON FARMER ACCEPTANCE ******************************************************
// **

// We update biditem both when buyer responds in a 30min window and when he doesnt accordingly

// **
const timeoutDuration = 30 * 60 * 1000; // 30 minutes in milliseconds

router.put("/acceptbid/:bidId", async (req, res) => {
  try {
    const { bidId } = req.params;
    const availableBid = await BidItem.findById(bidId);
    const updatedBid = await BidItem.findByIdAndUpdate(bidId, {
      $set: { status: "Pending", isAccepted: true },
      new: true,
    });

    return res.status(200).json(updatedBid);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// HANDLE BUYER RESPONSE BY MAKING OTHER UPDATES  ********************************************************
router.put("/buyerresponse/updatebid/:bidId", async (req, res) => {
  try {
    // GET TIME AND DATE AT THE MOMENT THIS ENDPOINT IS HIT
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`;

    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const isAM = hours < 12;

    let formattedHours = hours % 12;
    if (formattedHours === 0) {
      formattedHours = 12;
    }

    const formattedMinutes = minutes.toString().padStart(2, "0");
    const meridiem = isAM ? "AM" : "PM";

    const currentTime = `${formattedHours}:${formattedMinutes}${meridiem}`;

    console.log(currentTime, "current time upper");

    const formattedTime = currentTime;

    const updatedBid = await BidItem.findByIdAndUpdate(req.params.bidId, {
      $set: {
        buyerResponded: true,
        accepteddate: formattedDate,
        acceptedtime: req.body.currentTime,
      },
      new: true,
    });

    // ALSO UPDATE FARMER PRODUCE ITEM TO DEDUCT WHAT HAS BEEN BID
    try {
      const availableBid = await BidItem.findById(req.params.bidId);

      const { itemname, farmerId, quantitybuyerneeds, buyerId } = availableBid;

      if (availableBid) {
        // UPDATE PAYMENTS FOR THIS BUYER
        const updatedPayments = await Payments.findOneAndUpdate(
          { userId: buyerId },
          {
            $set: { seen_farmer_details: true },
          }
        );

        console.log(updatedPayments);

        // UPDATE FARMER PRODUCE
        const testItem = await FarmerProduce.findOne({ itemname, farmerId });
        console.log(testItem);
        const updatedFarmerProduce = await FarmerProduce.findOneAndUpdate(
          { itemname, farmerId },
          {
            $set: {
              itemquantity: testItem.itemquantity - quantitybuyerneeds,
            },
            new: true,
          }
        );

        console.log(updatedFarmerProduce, "produce for farmer");

        // UDPATE LIST OF FARMERS(FARMERSPECIFICS)
        const listOfFarmers = await FarmerSpecifics.findOne({
          itemname,
          farmerId,
        });

        const updatedListOfFarmers = await FarmerSpecifics.findOneAndUpdate(
          { itemname, farmerId },
          {
            $set: {
              itemquantity: listOfFarmers.itemquantity - quantitybuyerneeds,
            },
            new: true,
          }
        );

        console.log(updatedListOfFarmers, "listof farmers");

        // UPDATE ALL PRODUCE
        const allproduce = await AllProduce.findOne({
          itemname,
          farmerId,
        });

        const updatedProduce = await AllProduce.findOneAndUpdate(
          { itemname },
          {
            $set: {
              itemquantity: allproduce.itemquantity - quantitybuyerneeds,
            },
            new: true,
          }
        );

        console.log(updatedProduce, "listof farmers");
      } else {
        return res.status(400).json("No bid with this id");
      }

      // ALSO UPDATE GRAPH DATA
      // UPDATE THE GRAPH SECTION TOO TO CAPTURE THIS RANGE
      /**
           
          // Special fields to use to search are itemname and timerange
           
           */

      try {
        const getRange = () => {
          const timeRanges = [
            { name: "07:00 - 10:00Hrs" },
            { name: "10:00Hrs - 13:00Hrs" },
            { name: "13:00Hrs - 16:00Hrs" },
            { name: "16:00Hrs - 19:00Hrs" },
            { name: "19:00Hrs - 22:00Hrs" },
            { name: "22:00Hrs - 01:00Hrs" },
            { name: "01:00Hrs - 04:00Hrs" },
            { name: "04:00Hrs - 07:00Hrs" },
          ];

          function isTimeInRange(time) {
            for (const range of timeRanges) {
              const [start, end] = range.name.split(" - ");

              if (isTimeBetween(time, start, end)) {
                return range.name;
              }
            }

            return "Time not within any range";
          }

          function isTimeBetween(time, startTime, endTime) {
            const timeFormat = "hh:mm a";
            const currentTime = moment(time, timeFormat);
            const start = moment(startTime, timeFormat);
            const end = moment(endTime, timeFormat);
            return currentTime.isBetween(start, end);
          }

          const currentDate = new Date();
          const currentTime = currentDate.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          console.log(currentTime);

          const timeRangee = isTimeInRange(currentTime);
          console.log(timeRangee, "time range sorted ------");

          return timeRangee;
        };

        // GET TIME NOW
        const currentDate = new Date();

        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const isAM = hours < 12;

        let formattedHours = hours % 12;
        if (formattedHours === 0) {
          formattedHours = 12;
        }

        const formattedMinutes = minutes.toString().padStart(2, "0");
        const meridiem = isAM ? "AM" : "PM";

        const currentTime = `${formattedHours}:${formattedMinutes}${meridiem}`;

        console.log(currentTime, "current time upper");

        const graphData = new Graph({
          itemname: availableBid.itemname,
          yAxis: Number(availableBid.buyerprice),
          xAxis: req.body.currentTime,
          timerange: req.body.range,
        });
        const savedGraphData = await graphData.save();
        console.log(savedGraphData, "graph data ---");
      } catch (err) {
        console.log(err);
      }

      // RETURN UPDATED BID
      return res.status(200).json(availableBid);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    // return res.status(200).json(updatedBid);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
