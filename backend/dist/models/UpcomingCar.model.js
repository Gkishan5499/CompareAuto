"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UpcomingCarSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brandId: { type: String, required: true },
    brandName: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String },
    bodyType: { type: String },
    fuelTypes: { type: [String], default: [] },
    status: { type: String, default: "upcoming" },
    expectedPriceMin: { type: Number },
    expectedPriceMax: { type: Number },
    expectedLaunch: { type: String },
    launchWindow: { type: String },
    variantCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    keyFeatures: { type: [String], default: [] },
    media: {
        hero: { type: String },
        gallery: { type: [String], default: [] }
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("UpcomingCar", UpcomingCarSchema);
