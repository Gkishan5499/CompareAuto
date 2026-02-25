"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Variant_model_1 = __importDefault(require("../models/Variant.model"));
const db_1 = require("../config/db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Fix variants with decimal prices (e.g., 0.1049901 → 1049901)
 * Assumes prices < 1000 are in lakhs and should be multiplied by 100,000
 */
const fixDecimalPrices = async () => {
    await (0, db_1.connectDB)();
    try {
        // Find all variants with price < 1000 (likely in lakhs)
        const variants = await Variant_model_1.default.find({
            $or: [
                { price: { $gt: 0, $lt: 1000 } },
                { exShowroomPrice: { $gt: 0, $lt: 1000 } }
            ]
        });
        console.log(`Found ${variants.length} variants with decimal prices`);
        let fixed = 0;
        for (const variant of variants) {
            let updated = false;
            const updateObj = {};
            // Fix price
            if (variant.price && variant.price > 0 && variant.price < 1000) {
                const newPrice = Math.round(variant.price * 100000);
                console.log(`${variant.id}: price ${variant.price} → ${newPrice}`);
                updateObj.price = newPrice;
                updated = true;
            }
            // Fix exShowroomPrice
            if (variant.exShowroomPrice && variant.exShowroomPrice > 0 && variant.exShowroomPrice < 1000) {
                const newPrice = Math.round(variant.exShowroomPrice * 100000);
                console.log(`${variant.id}: exShowroomPrice ${variant.exShowroomPrice} → ${newPrice}`);
                updateObj.exShowroomPrice = newPrice;
                updated = true;
            }
            if (updated) {
                await Variant_model_1.default.updateOne({ id: variant.id }, { $set: updateObj });
                fixed++;
            }
        }
        console.log(`✓ Fixed ${fixed} variants`);
        process.exit(0);
    }
    catch (error) {
        console.error("Error fixing prices:", error);
        process.exit(1);
    }
};
fixDecimalPrices();
