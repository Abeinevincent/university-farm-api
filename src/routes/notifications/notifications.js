const router = require("express").Router();
const { verifyToken } = require("../../helpers/token");
const Notifications = require("../../models/Notifications");
const SupplierNotifications = require("../../models/SupplierNotifications");

// Create notifications(buyers & sellers)
router.post("/", async (req, res) => {
  try {
    const { buyerId, farmerId, itemname, message } = req.body;

    // Check if the notification exists already;
    const existingNotification = await Notifications.findOne({
      buyerId,
      farmerId,
      itemname,
      sendTo: "Buyer",
      message,
    });

    if (existingNotification) {
      return res.status(400).json("Notification already sent to the buyer!");
    } else {
      const newNotifications = new Notifications(req.body);
      const savedNotification = await newNotifications.save();
      return res.status(201).json(savedNotification);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// Create notifications(suppliers)
router.post("/suppliers", async (req, res) => {
  try {
    const newNotifications = new SupplierNotifications(req.body);
    const savedNotification = await newNotifications.save();
    return res.status(200).json(savedNotification);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// Get all notifications of a partcular farmer
router.get("/findfarmer/:farmerId", async (req, res) => {
  try {
    const notifications = await Notifications.find({
      farmerId: req.params.farmerId,
      sendTo: "Farmer",
    });
    return res.status(200).json(notifications);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// Get all notifications of a partcular buyer
router.get("/finduser/:id", async (req, res) => {
  try {
    // const notifications = await Notifications.find({
    //   buyerId: req.params.buyerId,
    //   sendTo: "Buyer",
    // });
    const notifications = await Notifications.find({
      $or: [
        { buyerId: req.params.id, sendTo: "Buyer" },
        { farmerId: req.params.id, sendTo: "Farmer" },
      ],
    });
    return res.status(200).json(notifications);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// Get all notifications of a partcular supplier
router.get("/supplier/findsupplier/:supplierId", async (req, res) => {
  try {
    const { supplierId } = req.params;
    const notifications = await SupplierNotifications.find({
      supplierId,
    });
    return res.status(200).json(notifications);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// Get all notifications of a partcular buyer
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const notifications = await Notifications.find({
      _id: req.params.id,
    });
    return res.status(200).json(notifications);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
