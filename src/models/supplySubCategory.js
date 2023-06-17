const mongoose = require("mongoose");

const SupplySubCategorySchema = new mongoose.Schema({
    subCategoryName: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    supplyCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SupplyCategory",
        required: true
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("SupplySubCategory", SupplySubCategorySchema);
