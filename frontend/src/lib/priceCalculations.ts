/**
 * Price Calculation Utility
 * Calculates on-road price with state taxes, RTO, and insurance
 * NOTE: City-to-state mapping moved to cityStateMapping.ts for backend sync
 */

import { CITY_TO_STATE, getStateFromCity, getAllCities, ALL_STATES } from "./cityStateMapping";
import type { InsuranceBreakup } from "@/types/pricing";

// Re-export for backward compatibility
export { getStateFromCity, getAllCities, ALL_STATES, CITY_TO_STATE } from "./cityStateMapping";
export type { InsuranceBreakup } from "@/types/pricing";

// Dynamic insurance calculator with segment/fuel/state uplifts
export const calcInsurance = (input: { exShowroom: number; fuelType?: string; engineCc?: number; stateCode?: string }): InsuranceBreakup => {
  const { exShowroom, fuelType, stateCode } = input;
  const notes: string[] = [];

  let basePercent = 0.056; // 5.6% typical for 5–10L petrol hatchbacks/CSUVs

  if (exShowroom < 500000) {
    basePercent = 0.058;
  } else if (exShowroom > 1000000 && exShowroom <= 2000000) {
    basePercent = 0.052;
  } else if (exShowroom > 2000000) {
    basePercent = 0.05;
  }

  const fuel = fuelType?.toLowerCase();
  if (fuel === "diesel") {
    basePercent += 0.002;
    notes.push("Diesel insurance uplift applied.");
  } else if (fuel === "ev" || fuel === "electric") {
    basePercent += 0.01;
    notes.push("EV insurance uplift applied.");
  }

  const upperState = (stateCode || "").toUpperCase();
  if (upperState === "KA" || upperState.includes("KARNATAKA")) {
    basePercent += 0.003;
    notes.push("Karnataka uplift applied (historically higher quotes).");
  }

  const premium = Math.round(exShowroom * basePercent);
  notes.push(`Approx insurance ~${(basePercent * 100).toFixed(2)}% of ex-showroom.`);

  return {
    premium,
    approxPercent: basePercent,
    notes,
  };
};

// Legacy constants (kept for backward compatibility in local fallback calculation)
// NOTE: These should not be used in production - prefer backend tax config
const STATE_TAX_RATES: Record<string, number> = {
  "Andhra Pradesh": 0.05, "Arunachal Pradesh": 0.05, Assam: 0.05, Bihar: 0.05, Chhattisgarh: 0.05,
  Goa: 0.05, Gujarat: 0.05, Haryana: 0.05, "Himachal Pradesh": 0.05, Jharkhand: 0.05, Karnataka: 0.05,
  Kerala: 0.05, "Madhya Pradesh": 0.05, Maharashtra: 0.05, Manipur: 0.05, Meghalaya: 0.05, Mizoram: 0.05,
  Nagaland: 0.05, Odisha: 0.05, Punjab: 0.05, Rajasthan: 0.05, Sikkim: 0.05, "Tamil Nadu": 0.05,
  Telangana: 0.05, Tripura: 0.05, "Uttar Pradesh": 0.05, Uttarakhand: 0.05, "West Bengal": 0.05,
  "Delhi NCR": 0.05, Delhi: 0.05,
};

const RTO_PERCENTAGE: Record<string, number> = {
  "Andhra Pradesh": 0.09, "Arunachal Pradesh": 0.08, Assam: 0.08, Bihar: 0.09, Chhattisgarh: 0.08,
  Goa: 0.08, Gujarat: 0.09, Haryana: 0.09, "Himachal Pradesh": 0.08, Jharkhand: 0.09, Karnataka: 0.08,
  Kerala: 0.10, "Madhya Pradesh": 0.09, Maharashtra: 0.09, Manipur: 0.08, Meghalaya: 0.08, Mizoram: 0.08,
  Nagaland: 0.08, Odisha: 0.09, Punjab: 0.09, Rajasthan: 0.09, Sikkim: 0.08, "Tamil Nadu": 0.09,
  Telangana: 0.09, Tripura: 0.08, "Uttar Pradesh": 0.09, Uttarakhand: 0.08, "West Bengal": 0.08,
  "Delhi NCR": 0.08, Delhi: 0.08,
};

const INSURANCE_PERCENTAGE = 0.035;

const REGISTRATION_FEE: Record<string, number> = {
  "Andhra Pradesh": 2500, "Arunachal Pradesh": 2000, Assam: 2000, Bihar: 2500, Chhattisgarh: 2500,
  Goa: 2500, Gujarat: 3000, Haryana: 2500, "Himachal Pradesh": 2000, Jharkhand: 2500, Karnataka: 3000,
  Kerala: 3000, "Madhya Pradesh": 2500, Maharashtra: 3000, Manipur: 2000, Meghalaya: 2000, Mizoram: 2000,
  Nagaland: 2000, Odisha: 2500, Punjab: 2500, Rajasthan: 2500, Sikkim: 2000, "Tamil Nadu": 3000,
  Telangana: 2500, Tripura: 2000, "Uttar Pradesh": 2500, Uttarakhand: 2000, "West Bengal": 2500,
  "Delhi NCR": 3000, Delhi: 3000,
};

export interface PriceBreakdown {
  exShowroomPrice: number;
  rto: number;              // Individual Registration (includes Road Tax + RTO + Reg Fee)
  insurance: number;        // Insurance premium
  tcs: number;              // Tax Collected at Source (1% on cars ≥10L)
  fastag: number;           // FASTag charges
  otherCharges: number;     // TCS + FASTag
  onRoadPrice: number;
}

/**
 * Calculate price breakdown for a given variant and city
 * @param exShowroomPrice - Base ex-showroom price in rupees
 * @param city - City name
 * @returns Price breakdown with all components
 */
export const calculatePriceBreakdown = (
  exShowroomPrice: number,
  city: string,
  options?: { fuelType?: string; engineCc?: number; stateCode?: string }
): PriceBreakdown => {
  if (!exShowroomPrice || exShowroomPrice <= 0) {
    return {
      exShowroomPrice: 0,
      rto: 0,
      insurance: 0,
      tcs: 0,
      fastag: 0,
      otherCharges: 0,
      onRoadPrice: 0,
    };
  }

  const state = options?.stateCode || getStateFromCity(city);
  const rtoRate = RTO_PERCENTAGE[state] || 0.09;
  const registrationFee = REGISTRATION_FEE[state] || 2500;

  // Individual Registration (RTO + Registration Fee)
  const rtoAmount = exShowroomPrice * rtoRate;
  const rto = Math.round(rtoAmount + registrationFee);

  // Insurance using smart calculation
  const insuranceCalc = calcInsurance({
    exShowroom: exShowroomPrice,
    fuelType: options?.fuelType,
    engineCc: options?.engineCc,
    stateCode: state,
  });

  const insurance = Number.isFinite(insuranceCalc.premium)
    ? insuranceCalc.premium
    : Math.round(exShowroomPrice * INSURANCE_PERCENTAGE);

  // TCS (Tax Collected at Source) - 1% on cars ≥10 lakh
  const tcs = exShowroomPrice >= 1000000 ? Math.round(exShowroomPrice * 0.01) : 0;

  // FASTag charges
  const stateCode = state.toUpperCase();
  let fastag = 500;
  if (stateCode === 'KARNATAKA' || stateCode === 'KA') fastag = 600;
  else if (stateCode === 'MAHARASHTRA' || stateCode === 'MH') fastag = 500;

  const otherCharges = tcs + fastag;
  const onRoadPrice = exShowroomPrice + rto + insurance + otherCharges;

  return {
    exShowroomPrice,
    rto,
    insurance,
    tcs,
    fastag,
    otherCharges,
    onRoadPrice: Math.round(onRoadPrice),
  };
};

/**
 * Calculate price breakdown using a tax configuration object fetched from backend.
 * This makes the frontend rely on backend-provided tax rates and fees.
 */
export const calculatePriceBreakdownWithConfig = (
  exShowroomPrice: number,
  config: { gstRate?: number; rtoPercentage?: number; insurancePercentage?: number; registrationFee?: number; state?: string },
  options?: { fuelType?: string; engineCc?: number; stateCode?: string }
): PriceBreakdown => {
  if (!exShowroomPrice || exShowroomPrice <= 0) {
    return {
      exShowroomPrice: 0,
      rto: 0,
      insurance: 0,
      tcs: 0,
      fastag: 0,
      otherCharges: 0,
      onRoadPrice: 0,
    };
  }

  const rtoRate = config.rtoPercentage ?? 0.09;
  const insurancePct = config.insurancePercentage ?? INSURANCE_PERCENTAGE;
  const registrationFee = config.registrationFee ?? 2500;

  // Individual Registration (RTO + Registration Fee)
  const rtoAmount = exShowroomPrice * rtoRate;
  const rto = Math.round(rtoAmount + registrationFee);

  // Insurance calculation
  const insuranceCalc = calcInsurance({
    exShowroom: exShowroomPrice,
    fuelType: options?.fuelType,
    engineCc: options?.engineCc,
    stateCode: options?.stateCode || config.state,
  });

  const insurance = Number.isFinite(insuranceCalc.premium)
    ? insuranceCalc.premium
    : Math.round(exShowroomPrice * insurancePct);

  // TCS (Tax Collected at Source) - 1% on cars ≥10 lakh
  const tcs = exShowroomPrice >= 1000000 ? Math.round(exShowroomPrice * 0.01) : 0;

  // FASTag charges
  const stateCode = (options?.stateCode || config.state || '').toUpperCase();
  let fastag = 500;
  if (stateCode === 'KARNATAKA' || stateCode === 'KA') fastag = 600;
  else if (stateCode === 'MAHARASHTRA' || stateCode === 'MH') fastag = 500;

  const otherCharges = tcs + fastag;
  const onRoadPrice = exShowroomPrice + rto + insurance + otherCharges;

  return {
    exShowroomPrice,
    rto,
    insurance,
    tcs,
    fastag,
    otherCharges,
    onRoadPrice: Math.round(onRoadPrice),
  };
};

/**
 * Get list of all states
 */
export const getAllStates = (): string[] => {
  return ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Delhi NCR"];
};



/**
 * Format price breakdown as percentage of ex-showroom
 */
export const getPriceBreakdownPercentages = (breakdown: PriceBreakdown) => {
  const base = breakdown.exShowroomPrice || 1;
  return {
    rto: ((breakdown.rto / base) * 100).toFixed(1),
    insurance: ((breakdown.insurance / base) * 100).toFixed(1),
    tcs: ((breakdown.tcs / base) * 100).toFixed(1),
    fastag: ((breakdown.fastag / base) * 100).toFixed(1),
  };
};
