const mongoose = require("mongoose");

const supplierProductSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    availability: {
        type: String,
        required: true 
    },
    image: {
        type: String,        
    },
    // url: {
    //     type: String
    // },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true
    },
    supplySubCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SupplySubCategory",
        required: true
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("SupplierProduct", supplierProductSchema);