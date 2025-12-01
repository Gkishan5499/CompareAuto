"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ElectricityRateSchema = new mongoose_1.Schema({
    state: { type: String, required: true },
    stateName: { type: String, required: true },
    discom: { type: String, required: true },
    discomName: { type: String, required: true },
    slab: { type: String, required: true },
    ratePerUnit: { type: Number, required: true },
    fixedPerDay: { type: Number, required: true },
    updated: { type: String }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("ElectricityRate", ElectricityRateSchema);
