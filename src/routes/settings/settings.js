const AuctionSetting = require("../../models/AuctionSetting");

const router = require("express").Router();

// auction settings

router.post("/acution", async(req, res) => {

    try {
        const auctionSetting = await AuctionSetting.create(req.body);
        return res.status(200).json({
            message: "Auction Settings Saved Successfully!",
            auctionSetting
        });
    } catch (error) {
        return res.status(500).json(error);
    }
});

router.put("/acution/:id", async(req, res) => {

    try {
        const auctionSetting = await AuctionSetting.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
        return res.status(200).json({
            message: "Auction Settings Updated Successfully!",
            auctionSetting
        });
    } catch (error) {
        return res.status(500).json(error);
    }
});

module.exports = router;