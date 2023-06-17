const mongoose = require("mongoose");
const { Schema } = mongoose;

const supplierServiceSchema = new Schema({
    service: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    availability: {
        type: Boolean,
        default: true 
    },
    images: {
        type: [String],
        default: []
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true
    },
    supplyCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SupplyCategory",
        required: true
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("SupplierService", supplierServiceSchema);

