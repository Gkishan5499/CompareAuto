"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DealerSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brands: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    dealerCode: { type: String, required: true },
    address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        pincode: String
    },
    phones: { type: [String], default: [] },
    email: { type: String },
    website: { type: String },
    hours: {
        mon_sat: String,
        sun: String
    },
    location: {
        lat: Number,
        lng: Number
    },
    rating: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    updated: { type: String },
    images: { type: [String], default: [] }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Dealer", DealerSchema);
