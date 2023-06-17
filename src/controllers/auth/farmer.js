const { generateToken } = require("../../helpers/token");
const FarmerInDistrict = require("../../models/FarmerInDistrict");
const farmerService = require("../../services/farmer");

// CREATE NEW FARMER
const createFarmer = async (req, res) => {
  try {
    // GET COODINATES OF SPECIFIED PLACE
    try {
      const response = await axios.get(`${process.env.OPENCAGE_URL}`, {
        params: {
          key: process.env.OPENCAGE_API_KEY,
          q: req.body.q,
        },
      });

      // Example coordinates in DMS format
      const latitude = Number(response.data.results[0].geometry.lat);
      const longitude = Number(response.data.results[0].geometry.lng);
      console.log(latitude, longitude);
      const farmer = await farmerService.store(req.body, longitude, latitude);

      //   REGISTER FARMER IN DISTRICT HERE *******
      try {
        const existingField = await FarmerInDistrict.findOneAndUpdate(
          { country: req.body.country, district: req.body.district },
          { $inc: { farmerCount: 1 } },
          { new: true }
        );
        if (existingField) {
          existingField.farmerCount += 1;
          console.log("field updated");
        } else {
          const farmerindistrict = new FarmerInDistrict({
            country: req.body.country,
            district: req.body.district,
          });
          const savedFarmerindistrict = await farmerindistrict.save();
          console.log(savedFarmerindistrict);
        }
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }

      return res
        .status(200)
        .json({ message: "Farmer registration successful.", farmer: farmer });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  } catch (error) {
    // TODO: Error is no being returned in json
    console.log(error);
    res.status(500).json({ message: error });
  }
};

// LOGIN FARMER
const loginFarmer = async (req, res) => {
  try {
    // Find user by email
    const user = await Farmer.findOne({ email: req.body.email });

    // Check whether the user exists in the database
    if (!user) {
      return res
        .status(404)
        .json(
          "Farmer with the provided email doesnot exist, please create an account!"
        );
    }

    // Compare passwords and if password is incorrect, tell the user to try again
    console.log(user, req.body.password, user.password);
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json("Incorrect password, please try again!");
    }

    // Token payload
    const tokenPayload = {
      id: user._id,
      email: user.email,
      isFarmer: user.isFarmer,
    };

    // hide password from the database
    const { password, ...others } = user._doc;

    // If the request is succcessful, return success message and user details
    return res.status(200).json({
      message: "Farmer login successful",
      ...others,
      token: generateToken(tokenPayload),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

module.exports = { createFarmer, loginFarmer };
