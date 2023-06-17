// Initialise the app as an express app
const express = require("express");
const http = require("http");
const app = express();
const server = http.Server(app);
const cron = require("node-cron");

// const Graph = require("./models/Graph"); // Import your Graph model

// Import all dependencies and dev-dependencies
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const dotenv = require("dotenv").config();
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const awsS3Client = require("aws-sdk/clients/s3");

// Import all routes
const AuthRoute = require("./routes/auth/admin/auth");
const FarmerAuth = require("./routes/auth/farmer/auth");
const BuyerAuth = require("./routes/auth/buyer/auth");
const SupplierAuth = require("./routes/auth/supplier/auth");
const BuyerRoute = require("./routes/users/buyer");
const FarmerRoute = require("./routes/users/farmer");
const FarmerProduceRoute = require("./routes/farmerproduce/FarmerProduce");
const AllProduceRoute = require("./routes/farmerproduce/AllProduce");
const VisitorsRoute = require("./routes/users/visitor");
const RatingsRoute = require("./routes/farmerrating/farmerrating");
const NotificationsRoute = require("./routes/notifications/notifications");
const FarmerSpecificsRoute = require("./routes/farmerspecifics/farmerspecifics");
const CartRoute = require("./routes/cart/cart");
const BidRoute = require("./routes/auction/biditem");
const PaymentRoute = require("./helpers/payments");
const SMSRoute = require("./helpers/sms");
const supplierRoutes = require("./routes/supplier/index");
const settingsRouter = require("./routes/settings/settings");

const momentTZ = require("moment-timezone");

// set a default timezone
momentTZ.tz.setDefault("Africa/Kampala");
// const errors = require("./routes/errors");

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected to the backend successfully");
  })
  .catch((err) => console.log(err));

// Middlewares
app.use(cors());

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
// app.use(errors.notFound);
// app.use(errors.generalErrorHandler);

// SCHDULE GRAPH GENERATION
// fileHelper.scheduleGraphCreation();

// Upload image to s3 bucket
const awsS3ClientConfiguration = {
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_ACCESS_SECRET,
  },
  sslEnabled: false,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
};

const s3 = new S3Client(awsS3ClientConfiguration);

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: "TESTING_METADATA" });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

// instatiate a new s3 client to use for getting bucket objects
const awsBucket = new awsS3Client(awsS3ClientConfiguration);

app.get("/api", async (req, res) => {
  return res.status(200).json("Welcome to the fromyfarm api V.1");
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    console.log("No file uploaded");
  } else {
    try {
      return res
        .status(200)
        .json({ message: "File uploaded successfully", file: req.file });
    } catch (error) {
      return console.error(error);
    }
  }
});

// Retrieve image from the s3 bucket
async function getImage(bucket, key) {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  const data = await awsBucket.getObject(params).promise();
  return data.Body;
}

app.use("/image/:key", async (req, res) => {
  const image = await getImage(process.env.S3_BUCKET_NAME, req.params.key);
  res.status(200).json(image);
});

app.use("/api/auth/farmer", FarmerAuth);
app.use("/api/auth/buyer", BuyerAuth);
app.use("/api/auth/supplier", SupplierAuth);
app.use("/api/users/buyer", BuyerRoute);
app.use("/api/users/farmer", FarmerRoute);
app.use("/api/farmerproduce", FarmerProduceRoute);
app.use("/api/allproduce", AllProduceRoute);
app.use("/api/visitors", VisitorsRoute);
app.use("/api/ratings", RatingsRoute);
app.use("/api/cart", CartRoute);
app.use("/api/notifications", NotificationsRoute);
app.use("/api/farmerspecifics", FarmerSpecificsRoute);
app.use("/api/biditem", BidRoute);
app.use("/api/sendsms", SMSRoute);
app.use("/api/payments", PaymentRoute);
app.use("/api", supplierRoutes);
app.use("/api/settings", settingsRouter);

// Start the backend server
const PORT = process.env.PORT || 8800;
server.listen(PORT, () => {
  console.log(`Backend server is listening at port ${PORT}`);
});

// include cron jobs
require("./services/jobs/cron.jobs");
