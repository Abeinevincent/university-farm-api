const mongoose = require("mongoose");

// Define a schema for token storage in MongoDB
const TokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

const TokenModel = mongoose.model("Token", TokenSchema);
