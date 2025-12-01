"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FuelPriceSchema = new mongoose_1.Schema({
    city: { type: String, required: true, unique: true },
    cityName: { type: String, required: true },
    petrol: { type: Number, required: true },
    diesel: { type: Number, required: true },
    cng: { type: Number, default: null },
    updated: { type: String }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("FuelPrice", FuelPriceSchema);
