"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VariantSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    modelId: { type: String, required: true }, // links to CarModel
    name: { type: String, required: true },
    slug: { type: String, required: true },
    price: { type: Number, required: true },
    fuelType: { type: String, required: true },
    transmission: { type: String, required: true },
    engine: { type: String },
    mileage: { type: Number },
    seating: { type: Number },
    colors: { type: [String], default: [] }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Variant", VariantSchema);
