import StateTaxConfig from "../models/StateTaxConfig.model";

const defaultStateTaxConfigs = [
  // States
  { state: "Andhra Pradesh", gstRate: 5, rtoPercentage: 8, insurancePercentage: 6, registrationFee: 2500, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
  { state: "Arunachal Pradesh", gstRate: 5, rtoPercentage: 8, insurancePercentage: 6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
  { state: "Assam", gstRate: 5, rtoPercentage: 8, insurancePercentage: 6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
  { state: "Bihar", gstRate: 5, rtoPercentage: 8, insurancePercentage: 6, registrationFee: 2500, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
  { state: "Chhattisgarh", gstRate: 5, rtoPercentage: 8, insurancePercentage: 6, registrationFee: 2500, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
  { state: "Goa", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2500, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Gujarat", gstRate: 5, rtoPercentage: 6, insurancePercentage: 5.4, registrationFee: 3000, rtoByFuelType: { petrol: 6 }, insuranceByFuelType: { petrol: 5.4 } },
  { state: "Haryana", gstRate: 5, rtoPercentage: 7, insurancePercentage: 5.6, registrationFee: 2500, rtoByFuelType: { petrol: 7 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Himachal Pradesh", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Jharkhand", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2500, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Karnataka", gstRate: 5, rtoPercentage: 13, insurancePercentage: 5.8, registrationFee: 3000, rtoByFuelType: { petrol: 13 }, insuranceByFuelType: { petrol: 5.8 } },
  { state: "Kerala", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 3000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Madhya Pradesh", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2500, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Maharashtra", gstRate: 5, rtoPercentage: 11, insurancePercentage: 5.8, registrationFee: 3000, rtoByFuelType: { petrol: 11 }, insuranceByFuelType: { petrol: 5.8 } },
  { state: "Manipur", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Meghalaya", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Mizoram", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Nagaland", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Odisha", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2500, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Punjab", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2500, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Rajasthan", gstRate: 5, rtoPercentage: 6, insurancePercentage: 5.4, registrationFee: 2500, rtoByFuelType: { petrol: 6 }, insuranceByFuelType: { petrol: 5.4 } },
  { state: "Sikkim", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Tamil Nadu", gstRate: 5, rtoPercentage: 9, insurancePercentage: 5.6, registrationFee: 2500, rtoByFuelType: { petrol: 9 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Telangana", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2500, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Tripura", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Uttar Pradesh", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2500, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Uttarakhand", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "West Bengal", gstRate: 5, rtoPercentage: 5, insurancePercentage: 5.4, registrationFee: 2000, rtoByFuelType: { petrol: 5 }, insuranceByFuelType: { petrol: 5.4 } },
  
  // Union Territories
  { state: "Andaman and Nicobar Islands", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Chandigarh", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Dadra & Nagar Haveli and Daman & Diu", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Delhi", gstRate: 5, rtoPercentage: 5, insurancePercentage: 5.4, registrationFee: 2000, rtoByFuelType: { petrol: 5 }, insuranceByFuelType: { petrol: 5.4 } },
  { state: "Delhi NCR", gstRate: 5, rtoPercentage: 5, insurancePercentage: 5.4, registrationFee: 2000, rtoByFuelType: { petrol: 5 }, insuranceByFuelType: { petrol: 5.4 } },
  { state: "Jammu & Kashmir", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Ladakh", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Lakshadweep", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
  { state: "Puducherry", gstRate: 5, rtoPercentage: 8, insurancePercentage: 5.6, registrationFee: 2000, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
];

/**
 * Seed function to initialize state tax configurations
 * Call this once during backend initialization or migration
 */
export const seedStateTaxConfigs = async () => {
  try {
    // Check if configs already exist
    const existingCount = await StateTaxConfig.countDocuments();
    
    if (existingCount > 0) {
      console.log(`State tax configs already exist (${existingCount} records). Skipping seed.`);
      return;
    }

    // Insert default configs
    await StateTaxConfig.insertMany(defaultStateTaxConfigs);
    console.log(`✓ Successfully seeded ${defaultStateTaxConfigs.length} state tax configurations`);
  } catch (error) {
    console.error("Error seeding state tax configurations:", error);
    throw error;
  }
};
