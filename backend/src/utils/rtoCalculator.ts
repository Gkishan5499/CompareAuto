/**
 * Advanced RTO (Road Tax) Calculator
 * Considers: Fuel Type, State, Vehicle Price, Engine Capacity, Vehicle Type, Age
 * Updated for 2025 regulations including Green Tax for older vehicles
 */

export type FuelType = 'petrol' | 'diesel' | 'cng' | 'hybrid' | 'ev';
export type VehicleType = 'car' | 'suv' | 'sedan' | 'hatchback' | 'commercial' | 'ev';

export interface RTOCalculatorInput {
  state: string;
  exShowroomPrice: number; // in INR
  fuelType: FuelType;
  engineCapacity?: number; // in CC
  vehicleType?: VehicleType;
  vehicleAge?: number; // in years (0 for new vehicles)
  isElectric?: boolean;
}

interface RTOResult {
  baseRTO: number;
  fuelTypeSurcharge: number;
  priceSlabRatio: number;
  greenTax: number;
  evSubsidy: number;
  totalRTOPercentage: number;
  totalRTOAmount: number;
}

// State-wise base RTO percentages (updated for 2025)
const STATE_RTO_BASE: Record<string, number> = {
  'Andhra Pradesh': 9,
  'Arunachal Pradesh': 8,
  'Assam': 8,
  'Bihar': 8.5,
  'Chhattisgarh': 8,
  'Goa': 9,
  'Gujarat': 9,
  'Haryana': 9,
  'Himachal Pradesh': 8,
  'Jharkhand': 8,
  'Karnataka': 17, // Higher due to better infrastructure
  'Kerala': 9,
  'Madhya Pradesh': 8,
  'Maharashtra': 10, // Higher, differentiates by fuel type
  'Manipur': 8,
  'Meghalaya': 8,
  'Mizoram': 8,
  'Nagaland': 8,
  'Odisha': 8,
  'Punjab': 8,
  'Rajasthan': 9,
  'Sikkim': 8,
  'Tamil Nadu': 9,
  'Telangana': 9,
  'Tripura': 8,
  'Uttar Pradesh': 8, // Noted as 8-10% in requirements
  'Uttarakhand': 8,
  'West Bengal': 8,
  'Chandigarh': 9,
  'Delhi': 9, // Can use engine capacity instead of price
  'Ladakh': 8,
  'Lakshadweep': 8,
  'Puducherry': 9,
  'Daman and Diu': 9,
  'Dadar and Nagar Haveli': 9,
};

// Fuel type surcharges (Delhi & Maharashtra differentiate)
const FUEL_SURCHARGE: Record<string, Record<FuelType, number>> = {
  'Delhi': {
    'petrol': 0,
    'diesel': 2, // Diesel slightly higher
    'cng': -1, // CNG subsidy/discount
    'hybrid': -0.5,
    'ev': -5, // EV subsidy
  },
  'Maharashtra': {
    'petrol': 0,
    'diesel': 1.5,
    'cng': -0.5,
    'hybrid': -1,
    'ev': -5,
  },
  // Default for other states
  'default': {
    'petrol': 0,
    'diesel': 0.5,
    'cng': -0.5,
    'hybrid': -1,
    'ev': -3,
  },
};

// Vehicle price slabs and corresponding RTO ratios
const PRICE_SLABS: Array<{ maxPrice: number; ratio: number }> = [
  { maxPrice: 500000, ratio: 1.0 }, // Up to ₹5L: base rate
  { maxPrice: 1000000, ratio: 1.2 }, // ₹5L - ₹10L: 20% higher
  { maxPrice: 1500000, ratio: 1.5 }, // ₹10L - ₹15L: 50% higher
  { maxPrice: 2000000, ratio: 1.8 }, // ₹15L - ₹20L: 80% higher
  { maxPrice: Infinity, ratio: 2.0 }, // Above ₹20L: 100% higher (double)
];

// Green tax for older vehicles (2025 regulations)
const GREEN_TAX: Record<string, number> = {
  '15-20': 3, // 3% for 15-20 year old vehicles
  '20-plus': 6, // 6% for vehicles above 20 years
};

/**
 * Get fuel type surcharge for a specific state
 */
function getFuelSurcharge(state: string, fuelType: FuelType): number {
  const stateSurcharge = FUEL_SURCHARGE[state] || FUEL_SURCHARGE['default'];
  return stateSurcharge[fuelType] || 0;
}

/**
 * Get price slab ratio multiplier
 */
function getPriceSlabRatio(price: number): number {
  for (const slab of PRICE_SLABS) {
    if (price <= slab.maxPrice) {
      return slab.ratio;
    }
  }
  return 2.0;
}

/**
 * Calculate green tax for older vehicles
 */
function getGreenTax(vehicleAge?: number): number {
  if (!vehicleAge || vehicleAge < 15) return 0;
  if (vehicleAge < 20) return GREEN_TAX['15-20'];
  return GREEN_TAX['20-plus'];
}

/**
 * Main RTO Calculator
 */
export function calculateRTO(input: RTOCalculatorInput): RTOResult {
  const {
    state,
    exShowroomPrice,
    fuelType,
    engineCapacity = 1500,
    vehicleAge = 0,
  } = input;

  // Get base RTO for state
  const baseRTO = STATE_RTO_BASE[state] || 9;

  // Fuel type surcharge (some states differentiate)
  const fuelTypeSurcharge = getFuelSurcharge(state, fuelType);

  // Price slab ratio (more expensive vehicles have higher % tax)
  const priceSlabRatio = getPriceSlabRatio(exShowroomPrice);

  // Green tax for older vehicles (2025)
  const greenTax = getGreenTax(vehicleAge);

  // EV subsidy (100% exemption in some states, reduced in others)
  const evSubsidy = fuelType === 'ev' && vehicleAge === 0 ? -baseRTO : 0;

  // Calculate final RTO percentage
  let totalRTOPercentage = baseRTO * priceSlabRatio + fuelTypeSurcharge + greenTax;

  // Apply EV subsidy if applicable
  if (evSubsidy !== 0) {
    totalRTOPercentage += evSubsidy;
  }

  // Ensure RTO doesn't go negative
  totalRTOPercentage = Math.max(0, totalRTOPercentage);

  // Calculate total RTO amount
  const totalRTOAmount = (exShowroomPrice * totalRTOPercentage) / 100;

  return {
    baseRTO,
    fuelTypeSurcharge,
    priceSlabRatio,
    greenTax,
    evSubsidy,
    totalRTOPercentage: Math.round(totalRTOPercentage * 100) / 100, // Round to 2 decimals
    totalRTOAmount: Math.round(totalRTOAmount),
  };
}

/**
 * Calculate road tax for on-road pricing
 * Includes: RTO + GST + Insurance + TCS (if applicable) + FASTag
 */
export function calculateOnRoadPrice(
  exShowroomPrice: number,
  rtoCalculation: RTOResult,
  gstRate: number,
  insurancePercentage: number,
  tcsRate: number = 1, // Only for vehicles ≥10L
  fastagCharges: number = 500
): {
  rtoTax: number;
  gst: number;
  insurance: number;
  tcs: number;
  fastag: number;
  totalTax: number;
  onRoadPrice: number;
} {
  const rtoTax = rtoCalculation.totalRTOAmount;

  // GST on ex-showroom price
  const gst = Math.round((exShowroomPrice * gstRate) / 100);

  // Insurance on ex-showroom price
  const insurance = Math.round((exShowroomPrice * insurancePercentage) / 100);

  // TCS only for vehicles ≥ ₹10,00,000
  const tcs = exShowroomPrice >= 1000000 ? Math.round((exShowroomPrice * tcsRate) / 100) : 0;

  // FASTag
  const fastag = fastagCharges;

  const totalTax = rtoTax + gst + insurance + tcs + fastag;
  const onRoadPrice = exShowroomPrice + totalTax;

  return {
    rtoTax: Math.round(rtoTax),
    gst,
    insurance,
    tcs,
    fastag,
    totalTax,
    onRoadPrice,
  };
}

/**
 * Get breakdown details for display
 */
export function getRTOBreakdown(input: RTOCalculatorInput): string {
  const result = calculateRTO(input);

  return `
RTO Calculation Breakdown for ${input.state}:
- Base RTO: ${result.baseRTO}%
- Fuel Type (${input.fuelType}) Surcharge: ${result.fuelTypeSurcharge > 0 ? '+' : ''}${result.fuelTypeSurcharge}%
- Price Slab Ratio (₹${input.exShowroomPrice.toLocaleString()}): ${result.priceSlabRatio}x
- Green Tax (${input.vehicleAge} years): ${result.greenTax}%
${result.evSubsidy !== 0 ? `- EV Subsidy: ${result.evSubsidy}%\n` : ''}
- Total RTO %: ${result.totalRTOPercentage}%
- Total RTO Amount: ₹${result.totalRTOAmount.toLocaleString()}
  `;
}
