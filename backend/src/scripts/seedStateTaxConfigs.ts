import StateTaxConfig from "../models/StateTaxConfig.model";

const defaultStateTaxConfigs = [
  { state: "Andhra Pradesh", gstRate: 5, rtoPercentage: 9, insurancePercentage: 3.5, registrationFee: 2500 },
  { state: "Arunachal Pradesh", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2000 },
  { state: "Assam", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2000 },
  { state: "Bihar", gstRate: 5, rtoPercentage: 9, insurancePercentage: 3.5, registrationFee: 2500 },
  { state: "Chhattisgarh", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2500 },
  { state: "Goa", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2500 },
  { state: "Gujarat", gstRate: 5, rtoPercentage: 9, insurancePercentage: 3.5, registrationFee: 3000 },
  { state: "Haryana", gstRate: 5, rtoPercentage: 9, insurancePercentage: 3.5, registrationFee: 2500 },
  { state: "Himachal Pradesh", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2000 },
  { state: "Jharkhand", gstRate: 5, rtoPercentage: 9, insurancePercentage: 3.5, registrationFee: 2500 },
  { state: "Karnataka", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 3000 },
  { state: "Kerala", gstRate: 5, rtoPercentage: 10, insurancePercentage: 3.5, registrationFee: 3000 },
  { state: "Madhya Pradesh", gstRate: 5, rtoPercentage: 9, insurancePercentage: 3.5, registrationFee: 2500 },
  { state: "Maharashtra", gstRate: 5, rtoPercentage: 9, insurancePercentage: 3.5, registrationFee: 3000 },
  { state: "Manipur", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2000 },
  { state: "Meghalaya", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2000 },
  { state: "Mizoram", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2000 },
  { state: "Nagaland", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2000 },
  { state: "Odisha", gstRate: 5, rtoPercentage: 9, insurancePercentage: 3.5, registrationFee: 2500 },
  { state: "Punjab", gstRate: 5, rtoPercentage: 9, insurancePercentage: 3.5, registrationFee: 2500 },
  { state: "Rajasthan", gstRate: 5, rtoPercentage: 9, insurancePercentage: 3.5, registrationFee: 2500 },
  { state: "Sikkim", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2000 },
  { state: "Tamil Nadu", gstRate: 5, rtoPercentage: 9, insurancePercentage: 3.5, registrationFee: 2500 },
  { state: "Telangana", gstRate: 5, rtoPercentage: 9, insurancePercentage: 3.5, registrationFee: 2500 },
  { state: "Tripura", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2000 },
  { state: "Uttar Pradesh", gstRate: 5, rtoPercentage: 9, insurancePercentage: 3.5, registrationFee: 2500 },
  { state: "Uttarakhand", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2000 },
  { state: "West Bengal", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2000 },
  { state: "Delhi", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2000 },
  { state: "Delhi NCR", gstRate: 5, rtoPercentage: 8, insurancePercentage: 3.5, registrationFee: 2000 },
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
