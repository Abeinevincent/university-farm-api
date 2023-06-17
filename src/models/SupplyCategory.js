const mongoose = require("mongoose");
const supplierProductModel = require("./supplierProduct");
const supplierServiceModel = require("./supplierService");

const SupplyCategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
},
{ timestamps: true }
);

SupplyCategorySchema.pre("remove", async function (next) {
  await supplierProductModel.deleteMany({ supplyCategory: this._id });
  await supplierServiceModel.deleteMany({ supplyCategory: this._id });
  next();
});

module.exports = mongoose.model("SupplyCategory", SupplyCategorySchema);
