"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CarModelSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brandId: { type: String, required: true },
    brandName: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, default: "/cars/placeholder.png" },
    gallery: { type: [String], default: [] },
    bodyType: { type: String },
    fuelTypes: { type: [String], default: [] },
    priceRange: {
        min: Number,
        max: Number
    },
    variantCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    status: { type: String, default: "on_sale" }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("CarModel", CarModelSchema);
