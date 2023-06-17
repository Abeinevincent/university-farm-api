const router = require("express").Router();
const axios = require("axios");

router.post("/", async (req, res) => {
  // TODO: Send message

  try {
    const { message, number } = req.body;
    const response = await axios.post(`${process.env.EGOSMSURL}`, {
      method: process.env.EGOSMSMETHOD,
      userdata: {
        username: process.env.EGOSMSUSERNAME,
        password: process.env.EGOSMSPASSWORD,
      },
      msgdata: [
        {
          number,
          message,
          senderid: process.env.EGOSMSSENDERID,
        },
      ],
    });
    console.log(response.data);
    return res.status(200).json(response.data);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
