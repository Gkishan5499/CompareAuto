"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UsedCarSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    brand: { type: String, required: true },
    carmodel: { type: String, required: true },
    variant: { type: String },
    year: { type: Number, required: true },
    fuel: { type: String, required: true },
    transmission: { type: String, required: true },
    kms: { type: Number, required: true },
    owners: { type: Number, required: true },
    city: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: [String], default: [] },
    features: { type: [String], default: [] },
    sellerType: { type: String },
    sellerName: { type: String },
    sellerPhone: { type: String },
    listingUrl: { type: String },
    verified: { type: Boolean, default: false }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("UsedCar", UsedCarSchema);
