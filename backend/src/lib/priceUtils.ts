// Backend price utilities: calculation helper using centralized city->state mapping
import StateTaxConfig from "../models/StateTaxConfig.model";
import { CITY_TO_STATE, getStateFromCity, ALL_STATES } from "./cityStateMapping";
import type { InsuranceBreakup } from "../types/pricing";

export { CITY_TO_STATE, getStateFromCity, ALL_STATES } from "./cityStateMapping";

// Dynamic insurance calculator with segment/fuel/state uplifts
export const calcInsurance = (input: { exShowroom: number; fuelType?: string; engineCc?: number; stateCode?: string }): InsuranceBreakup => {
  const { exShowroom, fuelType, stateCode } = input;
  const notes: string[] = [];

  // Base percent by ex-showroom segment
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
    basePercent += 0.002; // slight uplift for diesel
    notes.push("Diesel insurance uplift applied.");
  } else if (fuel === "ev" || fuel === "electric") {
    basePercent += 0.01; // EV batteries push higher OD premiums
    notes.push("EV insurance uplift applied.");
  }

  const upperState = (stateCode || "").toUpperCase();
  if (upperState === "KA" || upperState.includes("KARNATAKA")) {
    basePercent += 0.003; // KA often sees slightly higher quotes
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

export interface SimplePriceBreakdown {
  exShowroomPrice: number;
  rto: number;              // Individual Registration (includes Road Tax + RTO + Reg Fee)
  insurance: number;        // Insurance premium
  tcs: number;              // Tax Collected at Source (1% on cars ≥10L)
  fastag: number;           // FASTag charges
  otherCharges: number;     // TCS + FASTag
  onRoadPrice: number;
}

export const calculatePriceBreakdownWithConfig = (
  exShowroomPrice: number,
  config: { gstRate?: number; rtoPercentage?: number; insurancePercentage?: number; registrationFee?: number; state?: string; tcsRate?: number; fastagCharges?: number },
  options?: { fuelType?: string; engineCc?: number; stateCode?: string }
): SimplePriceBreakdown => {
  // Normalize percentage fields: allow storing as 5 (meaning 5%) or 0.05
  const normalize = (v: number | undefined, defaultVal: number) => {
    if (v === undefined || v === null) return defaultVal;
    return v > 1 ? v / 100 : v;
  };

  // TCS is always stored as percentage (1 means 1%, not 0.01), so always divide by 100
  const normalizeTcs = (v: number | undefined, defaultVal: number) => {
    if (v === undefined || v === null) return defaultVal;
    return v / 100;
  };

  const gstRate = normalize(config.gstRate, 0.05);
  const rtoRate = normalize(config.rtoPercentage, 0.09);
  const insurancePct = normalize(config.insurancePercentage, 0.035);
  const registrationFee = config.registrationFee ?? 2500;
  const tcsRate = normalizeTcs(config.tcsRate, 0.01); // Always treat as percentage
  const fastagCharges = config.fastagCharges ?? 500; // Default Rs. 500

  // Calculate Individual Registration (RTO = road tax percentage only, registration fee shown separately)
  const rtoAmount = Math.round(exShowroomPrice * rtoRate);
  const rto = rtoAmount; // RTO percentage only
  const registration = registrationFee; // Keep registration fee separate

  // Calculate Insurance using smart logic
  const insuranceCalc = calcInsurance({
    exShowroom: exShowroomPrice,
    fuelType: options?.fuelType,
    engineCc: options?.engineCc,
    stateCode: options?.stateCode || config.state,
  });

  const insurance = Number.isFinite(insuranceCalc.premium)
    ? insuranceCalc.premium
    : Math.round(exShowroomPrice * insurancePct);

  // Calculate TCS (Tax Collected at Source) - uses configured rate for vehicles ≥10 lakh
  const tcs = exShowroomPrice >= 1000000 ? Math.round(exShowroomPrice * tcsRate) : 0;

  // FASTag charges - uses configured value from database
  const fastag = fastagCharges;

  const otherCharges = tcs + fastag;
  const onRoadPrice = exShowroomPrice + rto + registration + insurance + otherCharges;

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
