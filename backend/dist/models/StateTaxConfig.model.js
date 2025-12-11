"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const StateTaxConfigSchema = new mongoose_1.Schema({
    state: { type: String, required: true, unique: true, index: true },
    gstRate: { type: Number, required: true, default: 5 },
    rtoPercentage: { type: Number, required: true, default: 9 },
    insurancePercentage: { type: Number, required: true, default: 3.5 },
    registrationFee: { type: Number, required: true, default: 2000 },
    tcsRate: { type: Number, default: 1 }, // 1% for vehicles ≥10L
    fastagCharges: { type: Number, default: 500 }, // Default FASTag charges
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("StateTaxConfig", StateTaxConfigSchema);
