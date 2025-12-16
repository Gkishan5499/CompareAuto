import Variant from "../models/Variant.model";
import { connectDB } from "../config/db";
import dotenv from "dotenv";

dotenv.config();

/**
 * Fix variants with decimal prices (e.g., 0.1049901 → 1049901)
 * Assumes prices < 1000 are in lakhs and should be multiplied by 100,000
 */
const fixDecimalPrices = async () => {
  await connectDB();

  try {
    // Find all variants with price < 1000 (likely in lakhs)
    const variants = await Variant.find({
      $or: [
        { price: { $gt: 0, $lt: 1000 } },
        { exShowroomPrice: { $gt: 0, $lt: 1000 } }
      ]
    });

    console.log(`Found ${variants.length} variants with decimal prices`);

    let fixed = 0;

    for (const variant of variants) {
      let updated = false;
      const updateObj: any = {};

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
        await Variant.updateOne({ id: variant.id }, { $set: updateObj });
        fixed++;
      }
    }

    console.log(`✓ Fixed ${fixed} variants`);
    process.exit(0);
  } catch (error) {
    console.error("Error fixing prices:", error);
    process.exit(1);
  }
};

fixDecimalPrices();
