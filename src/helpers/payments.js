const express = require("express");
const router = express.Router();
const axios = require("axios");
const Payments = require("../models/Payments");
// const { verifyToken } = require("../../helpers/jsonwebtoken");

// Generate userId with a custom function
const generateUniqueId = () => {
  let dt = new Date().getTime();
  let id = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    let r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return id;
};

router.post("/initiatepayment", async (req, res) => {
  // Define the headers to be sent in the POST request
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const generateToken = async () => {
    try {
      // Make the POST request using axios
      const response = await axios.post(
        `${process.env.PESAPAL_TOKEN_GENERATOR_URL}`,
        {
          consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
          consumer_key: process.env.PESAPAL_CONSUMER_KEY,
        },
        {
          headers,
        }
      );
      let token = response.data.token;
      console.log(token);

      //   REGISTER IPN URL
      try {
        const response = await axios.post(
          `${process.env.PESAPAL_TOKEN_IPN_REGISTRAR}`,
          {
            URL: process.env.IPN_URL,
            ipn_notification_type: process.env.IPN_NOTIICATION_TYPE,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const ipnId = response.data.ipn_id;

        // return res.status(200).json(response.data);

        // Initiate payment on users phone(momo)
        const { phone_number, amount, userId, full_name, email_address, city } =
          req.body;
        try {
          const dataFromUser = {
            id: generateUniqueId(),
            currency: "UGX",
            amount,
            description: process.env.DESCRIPTION,
            callback_url: process.env.CALLBACK_URL,
            redirect_mode: "",
            notification_id: ipnId,
            branch: "",
            billing_address: {
              email_address,
              phone_number,
              country_code: "",
              first_name: full_name,
              middle_name: "",
              last_name: "",
              line_1: "",
              line_2: "",
              city,
              state: "",
              postal_code: "",
              zip_code: "",
            },
          };

          const response = await axios.post(
            `${process.env.PROMPT_INITITATION_URL}`,
            dataFromUser,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          try {
            const availableDetail = await Payments.findOne({ userId });

            if (availableDetail) {
              const savedDetail = await Payments.findOneAndUpdate(
                { userId },
                {
                  phone_number,
                  amount,
                  full_name,
                  email_address,
                  city,
                  notification_id: ipnId,
                  order_tracking_id: response.data.order_tracking_id,
                  merchant_reference: response.data.merchant_reference,
                },
                { new: true }
              );
              // return res.status(200).json(savedDetail);
              console.log(savedDetail);
            } else {
              const newPaymentDetails = new Payments({
                userId,
                phone_number,
                amount,
                full_name,
                email_address,
                city,
                notification_id: ipnId,
                order_tracking_id: response.data.order_tracking_id,
                merchant_reference: response.data.merchant_reference,
              });

              const savedDetails = await newPaymentDetails.save();
              console.log(savedDetails);
            }
            return res.status(200).json(response.data);
          } catch (err) {
            console.log(err);
            return res.status(500).send(err);
          }
        } catch (err) {
          console.log(err);
          return res.status(500).send(err);
        }
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  };

  generateToken();
});

// GET TRANSACTION STATUS
router.get("/transaction-status/:userId", async (req, res) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  try {
    const { userId } = req.params;
    const availableUser = await Payments.findOne({ userId });

    console.log(availableUser);

    // TOKEN FOR ATHENTICATION
    const tokenGen = await axios.post(
      `${process.env.PESAPAL_TOKEN_GENERATOR_URL}`,
      {
        consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
        consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      },
      {
        headers,
      }
    );
    let token = tokenGen.data.token;

    // const { userId } = req.params.userId;
    // const availableUser = await Payments.findOne({ userId });
    console.log(availableUser, "userrrr");
    if (availableUser) {
      const response = await axios.get(
        `${process.env.PESAPAL_GET_TRANSACTION_STATUS_URL}?orderTrackingId=${availableUser?.order_tracking_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      if (response.data) {
        try {
          await Payments.findOneAndUpdate(
            {
              order_tracking_id: availableUser.order_tracking_id,
            },
            {
              status: response.data.payment_status_description.toLowerCase(),
            },
            { new: true }
          );
          console.log("Successfuly updated payments");
          // return res.status(200).json("Successfuly updated payments!");
        } catch (err) {
          console.log(err);
          return res.status(500).json(err);
        }
      } else {
        console.log("No response from the server!");
      }
      return res.status(200).json(response.data);
    } else {
      console.log("no available user yet!");
      return res
        .status(400)
        .json("User with provided ID doesnt have any payment history!");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// GET PAYMENT DETAILS OF A PARTICULAR USER BY USERID
router.get("/getdetails/:userId", async (req, res) => {
  try {
    const userDetails = await Payments.findOne({ userId: req.params.userId });
    return res.status(200).json(userDetails);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
