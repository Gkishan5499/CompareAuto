import StateTaxConfig from "../models/StateTaxConfig.model";

/**
 * Update script for existing state tax configurations with new RTO and Insurance percentages for Petrol
 * Run this script to update the database with the new values
 */

const updatedStateTaxConfigs = [
  // States
  { state: "Andhra Pradesh", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
  { state: "Arunachal Pradesh", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
  { state: "Assam", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
  { state: "Bihar", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
  { state: "Chhattisgarh", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
  { state: "Goa", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Gujarat", rtoPercentage: 6, insurancePercentage: 5.4, rtoByFuelType: { petrol: 6 }, insuranceByFuelType: { petrol: 5.4 } },
  { state: "Haryana", rtoPercentage: 7, insurancePercentage: 5.6, rtoByFuelType: { petrol: 7 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Himachal Pradesh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Jharkhand", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Karnataka", rtoPercentage: 13, insurancePercentage: 5.8, rtoByFuelType: { petrol: 13 }, insuranceByFuelType: { petrol: 5.8 } },
  { state: "Kerala", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Madhya Pradesh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Maharashtra", rtoPercentage: 11, insurancePercentage: 5.8, rtoByFuelType: { petrol: 11 }, insuranceByFuelType: { petrol: 5.8 } },
  { state: "Manipur", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Meghalaya", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Mizoram", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Nagaland", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Odisha", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Punjab", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Rajasthan", rtoPercentage: 6, insurancePercentage: 5.4, rtoByFuelType: { petrol: 6 }, insuranceByFuelType: { petrol: 5.4 } },
  { state: "Sikkim", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Tamil Nadu", rtoPercentage: 9, insurancePercentage: 5.6, rtoByFuelType: { petrol: 9 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Telangana", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Tripura", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Uttar Pradesh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Uttarakhand", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "West Bengal", rtoPercentage: 5, insurancePercentage: 5.4, rtoByFuelType: { petrol: 5 }, insuranceByFuelType: { petrol: 5.4 } },
  
  // Union Territories
  { state: "Andaman and Nicobar Islands", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Chandigarh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Dadra & Nagar Haveli and Daman & Diu", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Delhi", rtoPercentage: 5, insurancePercentage: 5.4, rtoByFuelType: { petrol: 5 }, insuranceByFuelType: { petrol: 5.4 } },
  { state: "Delhi NCR", rtoPercentage: 5, insurancePercentage: 5.4, rtoByFuelType: { petrol: 5 }, insuranceByFuelType: { petrol: 5.4 } },
  { state: "Jammu & Kashmir", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Ladakh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Lakshadweep", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Puducherry", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
];

export const updateStateTaxConfigs = async () => {
  try {
    let updatedCount = 0;
    let notFoundStates: string[] = [];

    console.log("Starting update of state tax configurations...");

    for (const config of updatedStateTaxConfigs) {
      const result = await StateTaxConfig.findOneAndUpdate(
        { state: config.state },
        {
          $set: {
            rtoPercentage: config.rtoPercentage,
            insurancePercentage: config.insurancePercentage,
            rtoByFuelType: config.rtoByFuelType,
            insuranceByFuelType: config.insuranceByFuelType,
          },
        },
        { new: true }
      );

      if (result) {
        updatedCount++;
        console.log(`✓ Updated ${config.state}: RTO ${config.rtoPercentage}%, Insurance ${config.insurancePercentage}%`);
      } else {
        notFoundStates.push(config.state);
        console.log(`✗ State not found: ${config.state}`);
      }
    }

    console.log(`\n✓ Successfully updated ${updatedCount} state tax configurations`);
    
    if (notFoundStates.length > 0) {
      console.log(`\n⚠ States not found in database (${notFoundStates.length}):`);
      notFoundStates.forEach(state => console.log(`  - ${state}`));
    }

    return { updatedCount, notFoundStates };
  } catch (error) {
    console.error("Error updating state tax configurations:", error);
    throw error;
  }
};

// If running this script directly
if (require.main === module) {
  const mongoose = require("mongoose");
  const dotenv = require("dotenv");

  dotenv.config();

  const run = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/camparecar");
      console.log("Connected to MongoDB");
      
      await updateStateTaxConfigs();
      
      await mongoose.connection.close();
      console.log("\nDatabase connection closed");
      process.exit(0);
    } catch (error) {
      console.error("Error:", error);
      process.exit(1);
    }
  };

  run();
}
