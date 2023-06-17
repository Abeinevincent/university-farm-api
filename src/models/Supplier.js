const mongoose = require("mongoose");
const supplierProductModel = require("./supplierProduct");
const supplierServiceModel = require("./supplierService");

const SupplierSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,        
    },
    country: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    subCounty: {
        type: String,
        required: true
    },
    location: {
        longitude: {
            type: Number,
            required: true,
        },
        latitude: {
            type: Number,
            required: true,
        }          
    },    
    active: {
        type: Boolean,
        default: true
    },
    meta: {
        primaryPhoneNumber: {
            type: String,
            required: true            
        },
        alternatePhoneNumber: {
            type: String,                        
        },
        displayImg: {
            type: String
        }
    },
    isSupplier: {
        type: Boolean,
        default: true
    }
},
{ timestamps: true }
);

SupplierSchema.pre('remove', async function(){
    await supplierProductModel.deleteMany({supplier: this._id});
    await supplierServiceModel.deleteMany({supplier: this._id});       
});

module.exports = mongoose.model("Supplier", SupplierSchema);