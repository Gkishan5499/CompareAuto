"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FeatureFlagSchema = new mongoose_1.Schema({
    enableDealers: { type: Boolean, default: true },
    enableBodyTypes: { type: Boolean, default: true },
    enableGuides: { type: Boolean, default: false },
    enableAIPersona: { type: Boolean, default: true },
    enableUsedCars: { type: Boolean, default: true },
    enableNews: { type: Boolean, default: true },
    enableComparisons: { type: Boolean, default: true },
    enableTools: { type: Boolean, default: true },
    enableAdSlots: { type: Boolean, default: true }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("FeatureFlag", FeatureFlagSchema);
